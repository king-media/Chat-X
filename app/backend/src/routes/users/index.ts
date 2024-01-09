import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import {
    DynamoDBClient,
    QueryCommand,
    type QueryCommandInput
} from '@aws-sdk/client-dynamodb'


import { type User, Status, isBlank, parseDbUserName, isNotBlank, isFalsy } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight'
import { queryUser } from '../../utils'

const client = new DynamoDBClient()

const getUserByStatus = async (input: QueryCommandInput): Promise<User[] | null> => {
    const chatRoomCommand = new QueryCommand(input)
    const usersResponse = await client.send(chatRoomCommand)

    console.log(`DB User Response: ${JSON.stringify(usersResponse)}`)

    if (!usersResponse.Items) {
        return null
    }

    const users: User[] = usersResponse.Items.map(attr => ({
        id: String(attr.id.S),
        connectionId: String(attr.connectionId.S),
        createdAt: String(attr.createdAt.S),
        chatRooms: <User["chatRooms"]>attr.chatRooms.L?.map(dbM => ({
            id: dbM.M?.id.S,
            createdAt: dbM.M?.createdAt.S
        })),
        email: String(attr.email.S),
        username: parseDbUserName(attr.username.S),
        status: String(attr.status.S) as Status
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

export const getUsersByStatus = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const status = String(event.pathParameters?.status).toUpperCase()
        const userId = String(event.queryStringParameters)

        if (isBlank(status) || !Object.values(Status).includes(status)) {
            console.log("Request error: Status was not given.", `Given: ${status}, Expected: ${Object.values(Status)}`)
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: "Bad Request: Include a filter status" })
            }
        }

        console.log('getting list of user\'s from DB')

        const input: QueryCommandInput = {
            ExpressionAttributeNames: {
                "#S": "status"
            },
            ExpressionAttributeValues: {
                ":status": {
                    S: status
                },
                ":id": {
                    S: userId
                }
            },
            KeyConditionExpression: "#S = :status",
            FilterExpression: "id <> :id",
            ProjectionExpression: 'id, username, #S, createdAt, email, connectionId, chatRooms',
            TableName: 'chatx-users',
            IndexName: "status-createdAt-index"
        }

        const users = await getUserByStatus(input)

        if (isBlank(users)) {
            console.log("DB Error: Users were not found!")
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Not Found: users were not found!' })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: users })
        }
    } catch (e) {
        console.log('Error getting users', JSON.stringify(e))
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


export const getUserByUsername = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const username = event.pathParameters?.username
        const status = event.queryStringParameters?.status

        if (isBlank(username)) {
            console.log("Request error: User id was not given.", `Given: ${username}, Expected: String`)
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: "Bad Request: Include a filter status" })
            }
        }

        console.log('getting list of user\'s from DB')


        const user = await queryUser(String(username), status?.toUpperCase() ?? status)

        if (isBlank(user)) {
            console.log("DB Error: User was not found!")
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Not Found: users were not found!' })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: user })
        }
    } catch (e) {
        console.log('Error getting user', JSON.stringify(e))
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: e })
        }
    }
}
