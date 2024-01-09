import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { signInLambda, signUpLambda } from '../../routes/signup';
import { corsHeaders } from './preflight';

enum AuthRouteKeys {
    SignUpEvent = "POST /signup",
    SignInEvent = "POST /signin"
}

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const requestOrigin = String(event.headers.origin)
    const { routeKey } = event

    switch (routeKey) {
        case AuthRouteKeys.SignInEvent:
            return signInLambda(event)

        case AuthRouteKeys.SignUpEvent:
            return signUpLambda(event)

        default:
            console.log('Invalid route given')
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Route undefined! Please request signin or signup' })
            };
    }
};
