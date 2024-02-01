import type {
    APIGatewayProxyEvent,
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    APIGatewayProxyStructuredResultV2,
    Context
} from "aws-lambda";

import { corsHeaders } from "../api/http/preflight";
import { OauthTokenResponse } from "@chatx/shared";

export const tokenInfo: OauthTokenResponse = {
    access_token: 'access-123x',
    token_type: "bearer",
    expires_in: 20
}

export const testTokenRequest = async (tokenResponse: OauthTokenResponse = tokenInfo) => ({
    status: 200,
    body: null,
    json: async () => (tokenResponse)
})

export const createResponse = (statusCode: number, data: any, overrideHeaders?: APIGatewayProxyStructuredResultV2['headers']): APIGatewayProxyResultV2 => ({
    statusCode,
    headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": "*",
        ...overrideHeaders,
    },
    body: JSON.stringify({ data })
})

export const mockLambdaProxyArgs = (eventVals?: Partial<APIGatewayProxyEventV2>, contextVals?: Partial<Context>) => {
    const event = {
        version: "",
        routeKey: "",
        rawPath: "",
        rawQueryString: "",
        headers: { origin: "example.com" },
        requestContext: {
            accountId: "",
            apiId: "",
            domainName: "",
            domainPrefix: "",
            http: {
                method: "",
                path: "",
                protocol: "",
                sourceIp: "",
                userAgent: ""
            },
            requestId: "",
            routeKey: "",
            stage: "",
            time: "",
            timeEpoch: 0
        },
        isBase64Encoded: false,
        ...eventVals
    }

    const context = {
        callbackWaitsForEmptyEventLoop: false,
        functionName: "",
        functionVersion: "",
        invokedFunctionArn: "",
        memoryLimitInMB: "",
        awsRequestId: "",
        logGroupName: "",
        logStreamName: "",
        getRemainingTimeInMillis: function (): number {
            throw new Error("Function not implemented.");
        },
        done: function (error?: Error | undefined, result?: any): void {
            throw new Error(`Function not implemented. ${error}${result}`);
        },
        fail: function (error: string | Error): void {
            throw new Error(`Function not implemented.${error}`);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        succeed: function (messageOrObject: any): void {
            throw new Error(`Function not implemented. ${messageOrObject}`);
        },
        ...contextVals
    }

    return { event, context, cb: () => { } }
}

export const mockWebSocketProxyLambda = (
    cbOptionalVals: (event: APIGatewayProxyEvent, context: Context) => {
        eventVals?: Partial<APIGatewayProxyEvent>, contextVals?: Partial<Context>
    }
) => {
    const event: APIGatewayProxyEvent = {
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: "",
        isBase64Encoded: false,
        path: "",
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {
            accountId: "",
            apiId: "",
            authorizer: undefined,
            protocol: "",
            httpMethod: "",
            identity: {
                accessKey: null,
                accountId: null,
                apiKey: null,
                apiKeyId: null,
                caller: null,
                clientCert: null,
                cognitoAuthenticationProvider: null,
                cognitoAuthenticationType: null,
                cognitoIdentityId: null,
                cognitoIdentityPoolId: null,
                principalOrgId: null,
                sourceIp: "",
                user: null,
                userAgent: null,
                userArn: null
            },
            path: "",
            stage: "",
            requestId: "",
            requestTimeEpoch: 0,
            resourceId: "",
            resourcePath: ""
        },
        resource: "",
    }

    const context = {
        callbackWaitsForEmptyEventLoop: false,
        functionName: "",
        functionVersion: "",
        invokedFunctionArn: "",
        memoryLimitInMB: "",
        awsRequestId: "",
        logGroupName: "",
        logStreamName: "",
        getRemainingTimeInMillis: function (): number {
            throw new Error("Function not implemented.");
        },
        done: function (error?: Error | undefined, result?: any): void {
            throw new Error(`Function not implemented. ${error}${result}`);
        },
        fail: function (error: string | Error): void {
            throw new Error(`Function not implemented.${error}`);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        succeed: function (messageOrObject: any): void {
            throw new Error(`Function not implemented. ${messageOrObject}`);
        },
    }

    const { eventVals, contextVals } = cbOptionalVals(event, context)

    return {
        event: { ...event, ...eventVals },
        context: { ...context, ...contextVals },
        cb: () => { }
    }
}