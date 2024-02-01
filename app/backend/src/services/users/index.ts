import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
    DynamoDBDocumentClient,
    PutCommand,
    PutCommandInput,
    QueryCommand,
    UpdateCommandInput,
    type QueryCommandInput,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb"

import {
    type User,
    Status,
    isBlank,
    isNotBlank,
    parseDbUserName,
    stringifyDbUserName,
    isFalsy
} from "@chatx/shared"
import { dbConfig } from "../../utils/dynamodb-config"
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient(dbConfig)
const ddbDocClient = DynamoDBDocumentClient.from(client)

export const queryUserByName = async (username: string, status?: string): Promise<User | null> => {
    const input: QueryCommandInput = {
        ExpressionAttributeNames: {
            "#S": "status"
        },
        ExpressionAttributeValues: {
            ":status": {
                S: <Status>status?.toUpperCase()
            },
            ":username": {
                S: username
            }
        },
        FilterExpression: "contains (username, :username)",
        TableName: "chatx-users",
        IndexName: "status-createdAt-index"
    }

    if (isNotBlank(status)) {
        input.KeyConditionExpression = "#S = :status"
    }

    const command = new QueryCommand(input)
    const queryUserResponse = await ddbDocClient.send(command)

    if (!queryUserResponse.Items || isBlank(queryUserResponse.Items)) {
        return null
    }

    console.log("Query response:", JSON.stringify(queryUserResponse.Items))

    return {
        id: queryUserResponse.Items[0].id,
        username: queryUserResponse.Items[0].username,
        email: queryUserResponse.Items[0].email,
        password: queryUserResponse.Items[0].password,
        createdAt: queryUserResponse.Items[0].createdAt,
        status: Status.ONLINE
    }
}

export const queryUserByConnection = async (connectionId: string, status: string) => {
    const input: QueryCommandInput = {
        ExpressionAttributeNames: {
            "#S": "status"
        },
        ExpressionAttributeValues: {
            ":status": {
                S: <Status>status.toUpperCase()
            },
            ":connectionId": {
                S: connectionId
            },
        },
        KeyConditionExpression: "#S = :status",
        FilterExpression: "connectionId = :connectionId",
        ProjectionExpression: 'id, username, #S, createdAt, email, connectionId, chatRooms',
        TableName: 'chatx-users',
        IndexName: "status-createdAt-index"
    }

    const command = new QueryCommand(input)
    const queryUserResponse = await ddbDocClient.send(command)

    return isNotBlank(queryUserResponse.Items) ? queryUserResponse.Items[0] : null
}

export const queryUsers = async (userId: string, status?: string): Promise<User[] | null> => {
    const input: QueryCommandInput = {
        ExpressionAttributeNames: {
            "#S": "status"
        },
        ExpressionAttributeValues: {
            ":status": {
                S: <Status>status?.toUpperCase()
            },
            ":id": {
                S: userId
            }
        },
        FilterExpression: "id <> :id",
        ProjectionExpression: 'id, username, #S, createdAt, email, connectionId, chatRooms',
        TableName: 'chatx-users',
        IndexName: "status-createdAt-index"
    }

    if (isNotBlank(status)) {
        input.KeyConditionExpression = "#S = :status"
    }

    const chatRoomCommand = new QueryCommand(input)
    const usersResponse = await ddbDocClient.send(chatRoomCommand)

    console.log(`DB User Response: ${JSON.stringify(usersResponse)}`)

    if (!usersResponse.Items) {
        return null
    }

    const users: User[] = usersResponse.Items.map(attr => ({
        id: attr.id,
        connectionId: attr.connectionId,
        createdAt: attr.createdAt,
        chatRooms: <User["chatRooms"]>attr.chatRooms,
        email: attr.email,
        username: parseDbUserName(attr.username),
        status: attr.status as Status
    }))

    let validUsers: boolean = true
    users.forEach(user => {
        validUsers = Object.values(user)
            .every(val => isNotBlank(val) && val !== "undefined")
    })

    console.log(`Users list: ${JSON.stringify(users)}`, `Is valid: ${validUsers}`)

    if (isFalsy(validUsers)) {
        return null
    }

    return users
}

export const addUser = async (user: User) => {
    const input: PutCommandInput = {
        Item: {
            connectionId: user.connectionId,
            id: user.id || uuidv4(),
            username: stringifyDbUserName(user.username, user.email),
            email: user.email,
            password: user.password,
            chatRooms: [],
            createdAt: user.createdAt || new Date().toISOString(),
            status: Status.ONLINE
        },
        TableName: 'chatx-users'
    }
    const command = new PutCommand(input)
    return await ddbDocClient.send(command)
}

export const updateUserConnection = async (id: string, createdAt: string) => {
    const input: UpdateCommandInput = {
        ExpressionAttributeNames: {
            "#S": "status"
        },
        ExpressionAttributeValues: {
            ":status": { S: Status.OFFLINE },
            ":connectionId": { S: '' }
        },
        Key: {
            id: {
                S: id
            },
            createdAt: {
                S: createdAt
            }
        },
        UpdateExpression: "SET connectionId = :connectionId, #S = :status",
        ReturnValues: "ALL_NEW",
        TableName: 'chatx-users'
    }

    const command = new UpdateCommand(input)
    return await ddbDocClient.send(command)
}