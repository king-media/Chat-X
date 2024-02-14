import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { isBlank, Message } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight'
import { handleApiErrors } from '../../utils'
import { getMessagesByChatId, addMessagesToDb } from '../../services/messages'

export const getChatMessages = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const chatId = String(event.pathParameters?.chatId)

        console.log('getting chat messages from DB')

        const messages = await getMessagesByChatId(chatId)

        if (isBlank(messages)) {
            console.log("DB Error getting chat messages")
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: "Not Found: Chat messages not found!" })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: messages })
        }
    } catch (e) {
        console.log('Error getting chat messages', e)
        return handleApiErrors<APIGatewayProxyResultV2>(e, requestOrigin, "Chat messages")
    }
}

export const addChatMessages = async (event): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const chatId = String(event.pathParameters?.chatId)
        const messages: Message[] = JSON.parse(event.body)

        console.log('adding chat message to DB')

        const batchMessagesResponse = await addMessagesToDb(messages)

        if (batchMessagesResponse.$metadata.httpStatusCode !== 200) {
            console.log(`DB Query failed: ${batchMessagesResponse}`)
            return {
                statusCode: 500,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: "Error: Could not add message to DB" })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: `Added messages to chat: ${chatId}` })
        }
    } catch (e) {
        console.log('Error adding chat messages', e)
        return handleApiErrors<APIGatewayProxyResultV2>(e, requestOrigin)
    }
}