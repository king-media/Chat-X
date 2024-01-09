import {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
    type ApiGatewayManagementApiServiceException,
    type PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi"
import { DynamoDBClient, QueryCommandInput, QueryCommand } from "@aws-sdk/client-dynamodb"
import { type User, Status, isBlank, isNotBlank } from "@chatx/shared"

export type sendSocketMessageResponse = {
    result: "ok" | "warn" | "error",
    statusCode: number
    error?: ApiGatewayManagementApiServiceException
}

export const sendSocketMessage = async (
    connections: string[],
    messageData: { type: string, message: object },
    endpoint: string | undefined = process.env.WSSAPI_ENDPOINT
): Promise<sendSocketMessageResponse> => {
    try {
        const client = new ApiGatewayManagementApiClient({ endpoint })

        const postMessageCommands = connections.map(ConnectionId => {
            const input: PostToConnectionCommandInput = {
                ConnectionId,
                Data: Buffer.from(JSON.stringify(messageData))
            }

            const command = new PostToConnectionCommand(input)
            return client.send(command)
        })

        console.log('Sending message to connected users!')

        const postMessagesResponse = await Promise.all(postMessageCommands)

        console.log("DB Response:", JSON.stringify(postMessagesResponse))
        return { statusCode: 200, result: "ok" }
    } catch (e) {
        const error = e as ApiGatewayManagementApiServiceException
        console.log("Send message error", JSON.stringify(error))

        if (error.$metadata.httpStatusCode === 410 || error.name === "GoneException") {
            console.log('Stale client: Deleting client connectionId from DB')
            return { result: "warn", statusCode: 410, error }
        }

        return { result: "error", statusCode: 500, error }
    }
}

export const queryUser = async (username: string, status?: string): Promise<User | null> => {
    try {
        const client = new DynamoDBClient();
        const input: QueryCommandInput = {
            ExpressionAttributeNames: {
                "#S": "status"
            },
            ExpressionAttributeValues: {
                ":status": {
                    S: <Status>status
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
        const queryUserResponse = await client.send(command)

        if (!queryUserResponse.Items || isBlank(queryUserResponse.Items)) {
            return null
        }

        console.log("Query response:", JSON.stringify(queryUserResponse.Items))

        return {
            id: String(queryUserResponse.Items[0].id.S),
            username: String(queryUserResponse.Items[0].username.S),
            email: queryUserResponse.Items[0].email.S,
            password: queryUserResponse.Items[0].password.S,
            createdAt: String(queryUserResponse.Items[0].createdAt.S),
            status: Status.ONLINE
        }
    } catch (e) {
        console.log('Error fetching user from DB', e)
        throw new Error(String(e))
    }
}