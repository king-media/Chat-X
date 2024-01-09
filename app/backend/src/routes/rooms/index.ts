import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import {
    DynamoDBClient,
    BatchGetItemCommand,
    PutItemCommand,
    type BatchGetItemCommandInput,
    type PutItemCommandInput,
    type AttributeValue
} from '@aws-sdk/client-dynamodb'

import { v4 as uuidv4 } from 'uuid';

import { type ChatList, Status, isBlank, type Chat, type User, isFalsy } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight';

const client = new DynamoDBClient()

const getChatList = async (input: BatchGetItemCommandInput, userId: string): Promise<ChatList | null> => {
    const chatRoomCommand = new BatchGetItemCommand(input)
    const rooms = await client.send(chatRoomCommand)

    console.log(`Rooms: ${JSON.stringify(rooms)}`)

    if (!rooms.Responses) {
        console.log(`DB Error: Missing Responses`, `${JSON.stringify(rooms)}`)
        return null
    }


    const chatRooms = rooms.Responses["chatx-rooms"].map(attr => ({
        id: String(attr.id.S),
        users: <Chat["users"]>attr.users.L?.map(dbM => ({
            id: String(dbM.M?.id.S),
            createdAt: String(dbM.M?.createdAt.S)
        })),
        createdAt: String(attr.createdAt.S)
    }))

    console.log(`Creating user keys for next query based on: ${JSON.stringify(chatRooms)}`)

    const userKeys = chatRooms.reduce<Record<string, AttributeValue>[]>((prev, room) => {
        const recipientKeys = room.users.filter(user => user.id !== userId)
            .map(recipient => ({
                id: { S: recipient.id },
                createdAt: { S: recipient.createdAt }
            }));

        const containsId = recipientKeys.some(key => prev.includes(key))

        if (containsId) {
            return prev
        }

        return [...prev, ...recipientKeys]
    }, [])

    console.log(`List of userKeys: ${JSON.stringify(userKeys)}`)

    const usersInput: BatchGetItemCommandInput = {
        RequestItems: {
            "chatx-users": {
                Keys: userKeys,
                ExpressionAttributeNames: {
                    "#S": "status"
                },
                ProjectionExpression: "id, username, email, chatRooms, connectionId, createdAt, #S"
            }
        }
    }

    const usersCommand = new BatchGetItemCommand(usersInput)
    const users = await client.send(usersCommand)

    const chatList: ChatList = []

    if (!users.Responses) {
        console.log(`DB Error: Users where not found!`, `${JSON.stringify(users)}`)
        return null
    }

    const chatUsers = users.Responses['chatx-users'].map(attr => ({
        id: String(attr.id.S),
        connectionId: String(attr.connectionId.S),
        chatRooms: <User["chatRooms"]>attr.chatRooms.L?.map(dbM => ({
            id: dbM.M?.id.S,
            createdAt: dbM.M?.createdAt.S
        })),
        username: String(attr.username.S),
        email: String(attr.email.S),
        status: attr.status.S as Status,
        createdAt: String(attr.createdAt.S)
    }))

    console.log(`Chat Users Mapped from DB: ${JSON.stringify(chatUsers)}`)

    chatRooms.forEach(chat => {
        const recipientUsers = chatUsers.filter(user => chat.users.some(u => u.id === user.id))
        chatList.push({ chat, recipientUsers })
    })

    console.log(`Resulting chatlist for client: ${JSON.stringify(chatList)}`)
    return chatList
}

export const getUserRooms = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const userId = String(event.pathParameters?.userId)
        const chats: { id: string, createdAt: string }[] = JSON.parse(String(event.queryStringParameters?.chats))

        console.log('getting list of user\'s chat rooms from DB')

        const Keys: Record<string, AttributeValue>[] = chats.map(chat => ({
            id: { S: chat.id },
            createdAt: { S: chat.createdAt }
        }))

        const input: BatchGetItemCommandInput = {
            RequestItems: {
                "chatx-rooms": {
                    Keys
                }
            }
        }

        const rooms = await getChatList(input, userId)

        if (isBlank(rooms)) {
            console.log('DB failed: not able to get chat rooms.')
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Not Found: Chat room was not found!' })
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

export const addUserRoom = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
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

        const dbUsers = body.map(user => ({
            M: {
                id: { S: user.id },
                createdAt: { S: user.createdAt }
            }
        }))

        const Item = {
            id: { S: uuidv4() },
            users: { L: dbUsers },
            createdAt: { S: new Date().toISOString() }
        }

        const input: PutItemCommandInput = {
            Item,
            TableName: 'chatx-rooms'
        }

        const command = new PutItemCommand(input)
        const putChatsResponse = await client.send(command)

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

        const newChat: Chat = {
            id: Item.id.S,
            users: body,
            createdAt: Item.createdAt.S
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: newChat })
        }
    } catch (e) {
        console.log('Error updating chat DB', e)
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