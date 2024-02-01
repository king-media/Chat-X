import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { getUserByUsername, getUsersByStatus } from '../../routes/users';
import { corsHeaders } from './preflight';

export enum UsersRouteKeys {
    UsersByStatusEvent = "GET /users/{status}",
    UserByName = "GET /users/get/{username}"
}

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const requestOrigin = String(event.headers.origin)
    const { routeKey } = event

    switch (routeKey) {
        case UsersRouteKeys.UsersByStatusEvent:
            return getUsersByStatus(event)

        case UsersRouteKeys.UserByName:
            return getUserByUsername(event)
        default:
            console.log('Invalid route given')
            return {
                statusCode: 404,
                headers: { ...corsHeaders, "Access-Control-Allow-Origin": requestOrigin },
                body: JSON.stringify({ data: 'Route undefined! Please request a user route.' }),
            };
    }
};
