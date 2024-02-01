import { createResponse, mockWebSocketProxyLambda } from "../../../utils/test-utils";
import { SocketRouteKeys, handler } from "../../socket/api-socket";
import { connectHandler } from "../../../routes/socket/on-connect";
import { disconnectHandler } from "../../../routes/socket/on-disconnect";
import { onMessagesHandler } from "../../../routes/socket/on-messages";

import type { APIGatewayProxyResult } from "aws-lambda";


jest.mock("../../../routes/socket/on-connect", () => ({
    __esModule: true,
    connectHandler: jest.fn()
}))

jest.mock("../../../routes/socket/on-disconnect", () => ({
    __esModule: true,
    disconnectHandler: jest.fn()
}))

jest.mock("../../../routes/socket/on-messages", () => ({
    __esModule: true,
    onMessagesHandler: jest.fn()
}))

const mockConnectHandler = connectHandler as jest.Mock<Promise<APIGatewayProxyResult>>
const mockDisconnectHandler = disconnectHandler as jest.Mock<Promise<APIGatewayProxyResult>>
const mockOnMessagesHandler = onMessagesHandler as jest.Mock<Promise<APIGatewayProxyResult>>

describe('API WebSocket Route Handler', () => {
    let expectedConnectResponse, expectedDisconnectResponse, expectedOnMessagesResponse
    beforeEach(() => {
        expectedConnectResponse = createResponse(200, "user connected")
        expectedDisconnectResponse = createResponse(200, "user disconnected")
        expectedOnMessagesResponse = createResponse(200, "message sent")

        mockConnectHandler.mockResolvedValue(expectedConnectResponse)
        mockDisconnectHandler.mockResolvedValue(expectedDisconnectResponse)
        mockOnMessagesHandler.mockResolvedValue(expectedOnMessagesResponse)
    })

    describe(`When user ${SocketRouteKeys.onConnect}`, () => {
        it('should return connected message.', async () => {
            const { event, context } = mockWebSocketProxyLambda((ev) => ({
                eventVals: { ...ev, requestContext: { ...ev.requestContext, routeKey: SocketRouteKeys.onConnect } }
            }))

            const response = await handler(event, context, () => { })

            expect(mockConnectHandler).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedConnectResponse)
        })
    })

    describe(`When user ${SocketRouteKeys.onDisconnect}`, () => {
        it('should return disconnect message.', async () => {
            const { event, context } = mockWebSocketProxyLambda((ev) => ({
                eventVals: { ...ev, requestContext: { ...ev.requestContext, routeKey: SocketRouteKeys.onDisconnect } }
            }))

            const response = await handler(event, context, () => { })

            expect(mockDisconnectHandler).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedDisconnectResponse)
        })
    })

    describe(`When user sends ${SocketRouteKeys.onMessage}`, () => {
        it('should return disconnect message.', async () => {
            const { event, context } = mockWebSocketProxyLambda((ev) => ({
                eventVals: { ...ev, requestContext: { ...ev.requestContext, routeKey: SocketRouteKeys.onMessage } }
            }))

            const response = await handler(event, context, () => { })

            expect(mockOnMessagesHandler).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedOnMessagesResponse)
        })
    })

    it('should return 400 bad request for incorrect route or other potential error', async () => {
        const { event, context } = mockWebSocketProxyLambda((ev) => ({
            eventVals: { ...ev, requestContext: { ...ev.requestContext, routeKey: "onAnotherAction" } }
        }))

        const response = await handler(event, context, () => { })
        const expected = {
            statusCode: 400,
            body: JSON.stringify({
                data: `Please provide the correct socket action! Options: ${Object.values(SocketRouteKeys).join(',')}.`
            })
        }

        expect(response).toStrictEqual(expected)

    })
})