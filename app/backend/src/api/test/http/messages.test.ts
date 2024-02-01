import { createResponse, mockLambdaProxyArgs } from "../../../utils/test-utils";
import { MessagesRouteKeys, handler } from "../../http/messages";
import { addChatMessage, getChatMessages } from "../../../routes/messages";

import { mockMessages } from "../mocks";
import type { APIGatewayProxyResultV2 } from "aws-lambda";


jest.mock("../../../routes/messages", () => ({
    __esModule: true,
    getChatMessages: jest.fn(),
    addChatMessage: jest.fn()
}))

const mockGetChatMessages = getChatMessages as jest.Mock<Promise<APIGatewayProxyResultV2>>
const mockAddChatMessages = addChatMessage as jest.Mock<Promise<APIGatewayProxyResultV2>>

describe('Messages Route Handler', () => {
    let expectedChatMessages, expectedMessage
    beforeEach(() => {
        expectedChatMessages = createResponse(200, mockMessages)
        expectedMessage = createResponse(200, { message: "completed" })

        mockGetChatMessages.mockResolvedValue(expectedChatMessages)
        mockAddChatMessages.mockResolvedValue(expectedMessage)
    })

    describe(`When ${MessagesRouteKeys.GetMessagesEvent} is called `, () => {
        it('should return all messages for chat.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: MessagesRouteKeys.GetMessagesEvent })
            const response = await handler(event, context, () => { })

            expect(mockGetChatMessages).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedChatMessages)
        })
    })

    describe(`When ${MessagesRouteKeys.AddMessageEvent} is called `, () => {
        it('should return all messages for chat.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: MessagesRouteKeys.AddMessageEvent })
            const response = await handler(event, context, () => { })

            expect(mockAddChatMessages).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedMessage)
        })
    })

    it('should return 404 bad request for incorrect route or other potential error', async () => {
        const { event, context } = mockLambdaProxyArgs({ routeKey: "GET /messages" })

        const response = await handler(event, context, () => { })

        expect(response).toStrictEqual(
            createResponse(404, 'Route undefined! Please request a message route.', {
                "Access-Control-Allow-Origin": String(event.headers.origin)
            }))
    })
})