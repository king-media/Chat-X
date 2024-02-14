import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
    DynamoDBDocumentClient,
    BatchGetCommand,
    type BatchGetCommandInput,
    PutCommandInput,
    PutCommand,
} from "@aws-sdk/lib-dynamodb"
import { isBlank, type Chat, type ChatList, type Status, type User } from "@chatx/shared"
import { dbConfig } from "../../utils/dynamodb-config"

const client = new DynamoDBClient(dbConfig)
const ddbDocClient = DynamoDBDocumentClient.from(client)

type ChatKeys = { id: string }[]

export const getChatList = async (Keys: ChatKeys, userId: string): Promise<ChatList | null> => {
    const input: BatchGetCommandInput = {
        RequestItems: {
            "chatx-rooms": {
                Keys
            }
        }
    }

    const chatRoomCommand = new BatchGetCommand(input)
    const rooms = await ddbDocClient.send(chatRoomCommand)

    console.log(`Rooms: ${JSON.stringify(rooms)}`)

    if (!rooms.Responses) {
        console.log(`DB Error: Missing Responses`, `${JSON.stringify(rooms)}`)
        return null
    }


    const chatRooms = rooms.Responses["chatx-rooms"].map(attr => ({
        id: attr.id,
        users: <Chat["users"]>attr.users,
        createdAt: attr.createdAt
    }))

    console.log(`Creating user keys for next query based on: ${JSON.stringify(chatRooms)}`)

    const userKeys = chatRooms.reduce<{ id: string }[]>((prev, room) => {
        const recipientKeys = room.users.filter(user => user.id !== userId)
            .map(recipient => ({
                id: recipient.id
            }));

        const dupelesIds = recipientKeys.filter(key => isBlank(prev.find(({ id }) => id === key.id)))

        return [...prev, ...dupelesIds]
    }, [])

    console.log(`List of userKeys: ${JSON.stringify(userKeys)}`)

    const usersInput: BatchGetCommandInput = {
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

    const usersCommand = new BatchGetCommand(usersInput)
    const users = await ddbDocClient.send(usersCommand)

    const chatList: ChatList = []

    if (!users.Responses) {
        console.log(`DB Error: Users where not found!`, `${JSON.stringify(users)}`)
        return null
    }

    const chatUsers: User[] = users.Responses['chatx-users'].map(attr => ({
        id: attr.id,
        connectionId: attr.connectionId,
        chatRooms: <User["chatRooms"]>attr.chatRooms,
        username: attr.username,
        email: attr.email,
        status: attr.status as Status,
        createdAt: attr.createdAt
    }))

    console.log(`Chat Users Mapped from DB: ${JSON.stringify(chatUsers)}`)

    chatRooms.forEach(chat => {
        const recipientUsers = chatUsers.filter(user => chat.users.some(u => u.id === user.id))
        chatList.push({ chat, recipientUsers })
    })

    console.log(`Resulting chatlist for client: ${JSON.stringify(chatList)}`)
    return chatList
}

export const addChatRoom = async (Item: Chat) => {
    const input: PutCommandInput = {
        Item,
        TableName: 'chatx-rooms'
    }

    const command = new PutCommand(input)
    return await ddbDocClient.send(command)
}