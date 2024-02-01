import {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
    type ApiGatewayManagementApiServiceException,
    type PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi"

import {
    InvalidEndpointException,
    ResourceNotFoundException
} from "@aws-sdk/client-dynamodb"

import { corsHeaders } from "../api/http/preflight"
import { SocketAction } from "@chatx/shared/types"

export type sendSocketMessageResponse = {
    result: "ok" | "warn" | "error",
    statusCode: number
    error?: ApiGatewayManagementApiServiceException
}

export const sendSocketMessage = async (
    connections: string[],
    messageData: { type: SocketAction, message: object },
    endpoint: string | undefined = process.env.WSSAPI_ENDPOINT
): Promise<sendSocketMessageResponse> => {
    try {
        const client = new ApiGatewayManagementApiClient({ endpoint })

        const postMessageCommands = connections.map(ConnectionId => {
            const input: PostToConnectionCommandInput = {
                ConnectionId,
                Data: Buffer.from(JSON.stringify(messageData))
            }

            const command = new PostToConnectionCommand(input)
            return client.send(command)
        })

        console.log('Sending message to connected users!')

        const postMessagesResponse = await Promise.all(postMessageCommands)

        console.log("DB Response:", JSON.stringify(postMessagesResponse))
        return { statusCode: 200, result: "ok" }
    } catch (e) {
        const error = e as ApiGatewayManagementApiServiceException
        console.log("Send message error", JSON.stringify(error))

        if (error.$metadata.httpStatusCode === 410 || error.name === "GoneException") {
            console.log('Stale client: Deleting client connectionId from DB')
            return { result: "warn", statusCode: 410, error }
        }

        return { result: "error", statusCode: 500, error }
    }
}

export const handleApiErrors = <APIResult>(e: unknown, requestOrigin: string, requestedResource?: string): APIResult => {
    let errorResponse = {
        statusCode: 500,
        headers: {
            ...corsHeaders,
            "Access-Control-Allow-Origin": requestOrigin
        },
        body: JSON.stringify({ data: String(e) })
    }

    if (e instanceof InvalidEndpointException) {
        errorResponse = {
            ...errorResponse,
            body: JSON.stringify({ data: "Database request failed due to an invalid endpoint used during request." })
        }
    }

    if (e instanceof ResourceNotFoundException) {
        errorResponse = {
            ...errorResponse,
            statusCode: 404,
            body: JSON.stringify({ data: `Not Found: ${requestedResource} not found!` })
        }
    }

    return <APIResult>errorResponse
}