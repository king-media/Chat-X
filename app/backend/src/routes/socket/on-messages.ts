/* eslint-disable no-case-declarations */
import type { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'

import {
    isNotBlank,
    SocketAction,
    type SocketEvent,
    type NewMessageEvent,
    type InitEvent,
    type User
} from '@chatx/shared';

import { handleApiErrors, sendSocketMessage, type SocketMessageResponse } from '../../utils';
import { addMessageToDb } from '../../services/messages';
import { getChatList } from '../../services/rooms';
import { getUsersByKeys } from '../../services/users';
export const onMessagesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const connectionId = String(event.requestContext.connectionId)
        const body: SocketEvent<unknown> = JSON.parse(String(event.body))

        let postMessagesResponse: SocketMessageResponse
        switch (body.type) {
            case SocketAction.INIT:
                // @ts-expect-error This is a stupid typescript error that has existed since 2016
                const requestInitEvent: InitEvent = body
                const [user]: User[] = await getUsersByKeys([{ id: String(requestInitEvent.metadata?.userId) }])
                const chatList = isNotBlank(user.chatRooms) ?
                    await getChatList(user.chatRooms, String(requestInitEvent.metadata?.userId))
                    : []

                const initEvent: InitEvent = {
                    action: "onMessage",
                    type: SocketAction.INIT,
                    message: connectionId,
                    metadata: { chatList, user }
                }
                postMessagesResponse = await sendSocketMessage([connectionId], initEvent)
                break;
            default:
                // @ts-expect-error This is a stupid typescript error that has existed since 2016
                const messageEvent: NewMessageEvent = body
                postMessagesResponse = await sendSocketMessage(<string[]>messageEvent.message.connections, body)

                if (postMessagesResponse.result === "ok") {
                    await addMessageToDb(messageEvent.message)
                }

                break;
        }

        if (postMessagesResponse.result === 'error') {
            return {
                statusCode: 500,
                body: JSON.stringify({ data: "Send Error: Could not send message. Message not delivered!" })
            }
        }

        if (postMessagesResponse.result === 'warn' && postMessagesResponse.statusCode === 410) {
            // Call -> when connection is considered stale updateConnections(postMessagesResponse.error)
            return {
                statusCode: 205,
                body: JSON.stringify({ data: "Send Warning: Message sent with stale connections removed!" })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ data: "Message sent!" })
        }
    } catch (e) {
        console.log('Error sending user message', JSON.stringify(e))
        return handleApiErrors<APIGatewayProxyResult>(e, "*")
    }
};
