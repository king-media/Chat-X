import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, QueryCommand, QueryCommandInput, UpdateItemCommand, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb'

import { type User, Status, parseDbUserName, isNotBlank } from '@chatx/shared';


const client = new DynamoDBClient()

const getUserFromDb = async (connectionId: string) => {
    const input: QueryCommandInput = {
        ExpressionAttributeNames: {
            "#S": "status"
        },
        ExpressionAttributeValues: {
            ":status": {
                S: Status.ONLINE
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
    const queryUserResponse = await client.send(command)

    return isNotBlank(queryUserResponse.Items) ? queryUserResponse.Items[0] : null
}

export const disconnectHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        const connectionId = String(event.requestContext.connectionId)

        const user = await getUserFromDb(connectionId)
        const input: UpdateItemCommandInput = {
            ExpressionAttributeNames: {
                "#S": "status"
            },
            ExpressionAttributeValues: {
                ":status": { S: Status.OFFLINE },
                ":connectionId": { S: '' }
            },
            Key: {
                id: {
                    S: String(user?.id.S)
                },
                createdAt: {
                    S: String(user?.createdAt.S)
                }
            },
            UpdateExpression: "SET connectionId = :connectionId, #S = :status",
            ReturnValues: "ALL_NEW",
            TableName: 'chatx-users'
        }

        console.log('Sending User put operation on DB')

        const command = new UpdateItemCommand(input)
        const updateUserResponse = await client.send(command)

        if (updateUserResponse.$metadata.httpStatusCode !== 200 || !updateUserResponse.Attributes) {
            console.log('user not updated', JSON.stringify(updateUserResponse))
            return {
                statusCode: Number(updateUserResponse.$metadata.httpStatusCode),
                body: JSON.stringify({ data: 'Error updating user!' })
            }
        }

        const updatedUser: User = {
            id: String(updateUserResponse.Attributes.id.S),
            connectionId: updateUserResponse.Attributes.connectionId.S,
            username: parseDbUserName(updateUserResponse.Attributes.username.S),
            email: updateUserResponse.Attributes.email.S,
            createdAt: String(updateUserResponse.Attributes.createdAt.S),
            status: <Status>updateUserResponse.Attributes.status.S
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                data: `User ${updatedUser.username} disconnected!`,
            })
        }
    } catch (e) {
        console.log('Error disconnecting user', JSON.stringify(e))
        return {
            statusCode: 500,
            body: JSON.stringify({ data: `User not updated ${e}` })
        }
    }
};
