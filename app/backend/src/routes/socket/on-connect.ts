import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb'

import { v4 as uuidv4 } from 'uuid';

import { Status } from '@chatx/shared';
import { stringifyDbUserName } from '@chatx/shared/user';


export const connectHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { connectionId } = event.requestContext

        if (!event.queryStringParameters) {
            return {
                statusCode: 400,
                body: JSON.stringify({ data: 'Error adding user: Must include user info as query string params.' })
            }
        }

        const { id, username, email, password, createdAt } = event.queryStringParameters

        const client = new DynamoDBClient()

        const input: PutItemCommandInput = {
            Item: {
                connectionId: {
                    S: String(connectionId)
                },
                id: {
                    S: id || uuidv4()
                },
                username: {
                    S: stringifyDbUserName(username, email)
                },
                email: {
                    S: String(email)
                },
                password: {
                    S: String(password)
                },
                chatRooms: {
                    L: []
                },
                createdAt: {
                    S: createdAt || new Date().toISOString()
                },
                status: {
                    S: Status.ONLINE
                }
            },
            TableName: 'chatx-users'
        }

        console.log('Sending User put operation on DB')

        const command = new PutItemCommand(input)
        const putUserResponse = await client.send(command)

        if (putUserResponse.$metadata.httpStatusCode !== 200) {
            console.log('user not added', JSON.stringify(putUserResponse))
            return {
                statusCode: Number(putUserResponse.$metadata.httpStatusCode),
                body: JSON.stringify({ data: 'Error adding user!' })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                data: "User added to DB and connection"
            })
        }
    } catch (e) {
        console.log('Error connecting user', JSON.stringify(e))
        return {
            statusCode: 500,
            body: JSON.stringify({ data: `User not added ${e}` })
        }
    }
};
