import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { v4 as uuidv4 } from 'uuid';

import { isBlank, type Chat, isFalsy } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight';
import { addChatRoom, getChatList } from '../../services/rooms';
import { handleApiErrors } from '../../utils';

export const getUserRooms = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const userId = String(event.pathParameters?.userId)
        const chats: { id: string, createdAt: string }[] = JSON.parse(String(event.queryStringParameters?.chats))

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
                body: JSON.stringify({ data: 'Not Found: Chat room not found!' })
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
        return handleApiErrors<APIGatewayProxyResultV2>(e, requestOrigin, "Chat room")
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

        const body: { id: string, createdAt: string }[] = JSON.parse(event.body)

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

        const Item: Chat = {
            id: uuidv4(),
            users: body,
            createdAt: new Date().toISOString()
        }

        const putChatsResponse = await addChatRoom(Item)

        if (putChatsResponse.$metadata.httpStatusCode !== 200) {
            console.log(`DB Error: failed: ${putChatsResponse}`)
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
            body: JSON.stringify({ data: Item })
        }
    } catch (e) {
        console.log('Error updating chat DB', e)
        return handleApiErrors<APIGatewayProxyResultV2>(e, requestOrigin)
    }
}