import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { getUserRooms, addUserRoom } from '../../routes/rooms';
import { corsHeaders } from './preflight';

export enum RoomsRouteKeys {
    GetRoomsEvent = "GET /rooms/{userId}",
    AddRoomEvent = "POST /rooms/{userId}"
}

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const requestOrigin = String(event.headers.origin)
    const { routeKey } = event

    switch (routeKey) {
        case RoomsRouteKeys.GetRoomsEvent:
            return getUserRooms(event)

        case RoomsRouteKeys.AddRoomEvent:
            return addUserRoom(event)

        default:
            console.log('Invalid route given')
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Route undefined! Please request a room route.' }),
            };
    }
};
