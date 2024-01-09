import type { APIGatewayProxyHandler } from 'aws-lambda'
import { connectHandler } from '../../routes/socket/on-connect';
import { disconnectHandler } from '../../routes/socket/on-disconnect';
import { onMessageHandler } from '../../routes/socket/on-messages';

enum SocketRouteKeys {
    onConnect = "$connect",
    onDisconnect = "$disconnect",
    onMessage = "onMessage"
}

export const handler: APIGatewayProxyHandler = async (event, context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const { routeKey } = event.requestContext

    switch (routeKey) {
        case SocketRouteKeys.onConnect:
            return connectHandler(event)

        case SocketRouteKeys.onDisconnect:
            return disconnectHandler(event)

        case SocketRouteKeys.onMessage:
            return onMessageHandler(event)

        default:
            return {
                statusCode: 400,
                body: `Please provide the correct socket action! Options: ${Object.values(SocketRouteKeys).join(',')}`
            }
    }
};
