import type { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'

import { type Message } from '@chatx/shared';
import { sendSocketMessage, type sendSocketMessageResponse } from '../../utils';

const updateConnections = (error: sendSocketMessageResponse['error']) => {
    // Batch remove users connectionId and flip status to OFFLINE 
}

export const onMessageHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body: { action: string, messageInput: Message & { connections: string[] } } = JSON.parse(String(event.body))

        console.log('Sending message to connected users!')

        const postMessagesResponse = await sendSocketMessage(body.messageInput.connections, body.messageInput)


        if (postMessagesResponse.result === 'error') {
            return {
                statusCode: 500,
                body: JSON.stringify({ data: "Send Error: Could not send message. Message not delivered!" })
            }
        }

        if (postMessagesResponse.result === 'warn') {
            // Call -> when connection is considered stale updateConnections(postMessagesResponse.error)
            return {
                statusCode: 205,
                body: JSON.stringify({ data: "Send Warning: Message sent with stale connections removed!" })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ data: "Message sent!" })
        }
    } catch (e) {
        console.log('Error connecting user', JSON.stringify(e))
        return {
            statusCode: 500,
            body: JSON.stringify({ data: `User not added ${e}` })
        }
    }
};
