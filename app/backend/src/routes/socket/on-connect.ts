import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { type User } from '@chatx/shared';

import { addUser } from '../../services/users';
import { corsHeaders } from '../../api/http/preflight';


export const connectHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { connectionId } = event.requestContext

        if (!event.queryStringParameters) {
            return {
                ...corsHeaders,
                statusCode: 400,
                body: JSON.stringify({ data: 'Error adding user: Must include user info as query string params.' })
            }
        }

        const user: User = { ...event.queryStringParameters, connectionId }

        console.log('Sending User put operation on DB')

        const putUserResponse = await addUser(user)

        if (putUserResponse.$metadata.httpStatusCode !== 200) {
            console.log('user not added', JSON.stringify(putUserResponse))
            return {
                ...corsHeaders,
                statusCode: Number(putUserResponse.$metadata.httpStatusCode),
                body: JSON.stringify({ data: 'Error adding user!' })
            }
        }

        return {
            ...corsHeaders,
            statusCode: 200,
            body: JSON.stringify({
                data: "User added to DB and connection"
            })
        }
    } catch (e) {
        console.log('Error connecting user', JSON.stringify(e))
        return {
            ...corsHeaders,
            statusCode: 500,
            body: JSON.stringify({ data: `User not added ${e}` })
        }
    }
};
