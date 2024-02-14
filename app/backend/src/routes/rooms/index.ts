import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { v4 as uuidv4 } from 'uuid';

import { isBlank, isFalsy, type Chat, type User } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight';
import { addChatRoom, getChatList } from '../../services/rooms';
import { handleApiErrors } from '../../utils';
import { updateUserChatRooms } from '../../services/users';

export const getUserRooms = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const userId = String(event.pathParameters?.userId)

        if (!event.queryStringParameters?.chats || isBlank(JSON.parse(event.queryStringParameters.chats))) {
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Not Found: No chat rooms given!' })
            }
        }

        const chats: { id: string }[] = JSON.parse(event.queryStringParameters.chats)

        console.log('getting list of user\'s chat rooms from DB')

        const rooms = await getChatList(chats, userId)

        if (isBlank(rooms)) {
            console.log('DB failed: not able to get chat rooms.')
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Not Found: Chat rooms not found!' })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: rooms })
        }
    } catch (e) {
        console.log('Error getting chats', e)
        return handleApiErrors<APIGatewayProxyResultV2>(e, requestOrigin, "Chat rooms")
    }
}

export const addUserRoom = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const userId = String(event.pathParameters?.userId)

        if (!event.body) {
            console.log("Error: Need event.body to complete request.")
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Must provide users in order to create chat.' })
            }
        }

        const body: { id: string, createdAt: string, username: string, chatRooms: { id: string }[] }[] = JSON.parse(event.body)

        if (isFalsy(body.some(user => user.id === userId))) {
            console.log("Error: Need to included user as a chat member.")
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Must provide users in order to create chat.' })
            }
        }

        const chat: Chat = {
            id: uuidv4(),
            users: body.map(({ id, createdAt, username }) => ({ id, createdAt, username })),
            createdAt: new Date().toISOString()
        }

        const recipientUsers: User[] = chat.users.filter(user => user.id !== userId)
        const putChatsResponse = await addChatRoom(chat)

        const updateUsersChats = body.map(user => updateUserChatRooms(user.id, [...user.chatRooms, { id: chat.id }]))

        const updatedChatsResponse = await Promise.all(updateUsersChats)

        console.log('update userChats', JSON.stringify(updatedChatsResponse))

        if (putChatsResponse.$metadata.httpStatusCode !== 200) {
            console.log(`DB Error: ${putChatsResponse}`)

            return {
                statusCode: 500,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Error creating chat' })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: { chat, recipientUsers } })
        }
    } catch (e) {
        console.log('Error updating chat DB', e)
        return handleApiErrors<APIGatewayProxyResultV2>(e, requestOrigin)
    }
}