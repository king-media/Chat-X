import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

export const customHeaders = {
    preferences: "x-preferences"
}

export const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    "Access-Control-Allow-Headers": `authorization,content-type,cache-control,${Object.values(customHeaders).join(',')}`,
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Max-Age": 8600
}

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);


    const allowedOrigins = [/^https:\/\//, "http://localhost:5173", "http://localhost:3000"]
    const requestOrigin = event.headers.origin

    if (!requestOrigin) {
        return {
            statusCode: 403,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": "null",
                "x-access-env": String(process.env.ACCESS_ENV)

            }
        }
    }

    const isAllowed = allowedOrigins.some(allowedOrigin => requestOrigin?.match(allowedOrigin))

    return {
        statusCode: 204,
        headers: {
            ...corsHeaders,
            "Access-Control-Allow-Origin": isAllowed ? requestOrigin : "null", // Mirror request origin if allowed
            "x-access-env": String(process.env.ACCESS_ENV)
        },

    }
}
