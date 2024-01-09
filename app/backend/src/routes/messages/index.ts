import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import {
    DynamoDBClient,
    QueryCommand,
    type QueryCommandInput,
    PutItemCommand,
    type PutItemCommandInput
} from '@aws-sdk/client-dynamodb'

import { isBlank, Message } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight'

const client = new DynamoDBClient()

const addMessageToDb = async (message: Message) => {
    const input: PutItemCommandInput = {
        Item: {
            chatId: {
                S: message.chatId
            },
            senderId: {
                S: message.senderId
            },
            connections: {
                SS: message.connections || [""]
            },
            text: {
                S: message.text
            },
            createdAt: {
                S: new Date().toISOString()
            },
            updatedAt: {
                S: new Date().toISOString()
            },
        },
        TableName: "chatx-messages"
    }

    const command = new PutItemCommand(input)
    const messageResponse = await client.send(command)

    return messageResponse
}

const getMessagesByChatId = async (chatId: string): Promise<Message[] | null> => {
    const input: QueryCommandInput = {
        ExpressionAttributeValues: {
            ":chatId": {
                S: chatId
            },
        },
        KeyConditionExpression: "chatId = :chatId",
        TableName: "chatx-messages",
    }

    const command = new QueryCommand(input)
    const messagesResponse = await client.send(command)

    if (!messagesResponse.Items) {
        console.log(`DB Query failed: ${messagesResponse}`)
        return null
    }

    return messagesResponse.Items.map(attr => ({
        chatId,
        connections: attr.connections.SS,
        senderId: String(attr.senderId.S),
        text: String(attr.text.S),
        createdAt: String(attr.createdAt.S),
        updatedAt: attr.updatedAt.S
    }))
}

export const getChatMessages = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
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
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: String(e) })
        }
    }
}

export const addChatMessage = async (event): Promise<APIGatewayProxyResult> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const chatId = String(event.pathParameters?.chatId)
        const message: Message = JSON.parse(event.body)

        console.log('adding chat message to DB')

        const messageResponse = await addMessageToDb(message)

        if (messageResponse.$metadata.httpStatusCode !== 200) {
            console.log(`DB Query failed: ${messageResponse}`)
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
            body: JSON.stringify({ data: `Added message to chat: ${chatId}` })
        }
    } catch (e) {
        console.log('Error adding chat messages', e)
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: String(e) })
        }
    }
}