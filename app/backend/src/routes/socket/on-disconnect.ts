import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'

import { type User, Status, parseDbUserName } from '@chatx/shared';
import { queryUserByConnection, updateUserConnection } from '../../services/users';

export const disconnectHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        const connectionId = String(event.requestContext.connectionId)

        const user = await queryUserByConnection(connectionId, Status.ONLINE)

        console.log('Sending User put operation on DB')

        const updateUserResponse = await updateUserConnection(user?.id, user?.createdAt)

        if (updateUserResponse.$metadata.httpStatusCode !== 200 || !updateUserResponse.Attributes) {
            console.log('user not updated', JSON.stringify(updateUserResponse))
            return {
                statusCode: Number(updateUserResponse.$metadata.httpStatusCode),
                body: JSON.stringify({ data: 'Error updating user!' })
            }
        }

        const updatedUser: User = {
            id: updateUserResponse.Attributes.id,
            connectionId: updateUserResponse.Attributes.connectionId,
            username: parseDbUserName(updateUserResponse.Attributes.username),
            email: updateUserResponse.Attributes.email,
            createdAt: updateUserResponse.Attributes.createdAt,
            status: <Status>updateUserResponse.Attributes.status
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
