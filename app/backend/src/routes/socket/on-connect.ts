import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { Status, isBlank } from '@chatx/shared';

import { updateUserConnection } from '../../services/users';


export const connectHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { connectionId } = event.requestContext

        if (!event.queryStringParameters || isBlank(event.queryStringParameters.userId)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ data: 'Error adding user: Must include user info as query string params.' })
            }
        }

        const userId = String(event.queryStringParameters.userId)

        console.log('Sending User put operation on DB')

        const updateUserResponse = await updateUserConnection(userId, Status.ONLINE, connectionId)

        if (updateUserResponse.$metadata.httpStatusCode !== 200) {
            console.log('user not added', JSON.stringify(updateUserResponse))
            return {
                statusCode: Number(updateUserResponse.$metadata.httpStatusCode),
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
