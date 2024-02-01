import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { getChatMessages, addChatMessage } from '../../routes/messages';
import { corsHeaders } from './preflight';

export enum MessagesRouteKeys {
    GetMessagesEvent = "GET /messages/{chatId}",
    AddMessageEvent = "POST /messages/{chatId}"
}

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const requestOrigin = String(event.headers.origin)
    const { routeKey } = event

    switch (routeKey) {
        case MessagesRouteKeys.GetMessagesEvent:
            return getChatMessages(event)

        case MessagesRouteKeys.AddMessageEvent:
            return addChatMessage(event)

        default:
            console.log('Invalid route given')
            return {
                statusCode: 404,
                headers: { ...corsHeaders, "Access-Control-Allow-Origin": requestOrigin },
                body: JSON.stringify({ data: 'Route undefined! Please request a message route.' }),
            };
    }
};
