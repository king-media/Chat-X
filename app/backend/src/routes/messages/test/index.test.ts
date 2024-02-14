import type { APIGatewayProxyResultV2 } from 'aws-lambda'

import { BatchWriteCommandOutput } from '@aws-sdk/lib-dynamodb'

import { Message } from '@chatx/shared'

import { mockMessages } from "../../../api/test/mocks";
import { createResponse, mockLambdaProxyArgs } from "../../../utils/test-utils"

import { getMessagesByChatId, addMessagesToDb } from '../../../services/messages'
import { getChatMessages, addChatMessages } from '../index';
import { DynamoDBServiceException, ResourceNotFoundException } from '@aws-sdk/client-dynamodb';

jest.mock('../../../services/messages', () => ({
    _esModule: true,
    getMessagesByChatId: jest.fn(),
    addMessagesToDb: jest.fn()
}))

const mockGetMessagesByChatId = getMessagesByChatId as jest.Mock<Promise<Message[]>>
const mockAddMessagesToDb = addMessagesToDb as jest.Mock<Promise<BatchWriteCommandOutput>>

describe('Messages Route', () => {
    let expectedQueryResponse, expectedMessages

    beforeEach(() => {
        // Reset mock values & set vars
        expectedMessages = [
            {
                chatId: mockMessages[0].chatId,
                senderId: mockMessages[0].senderId,
                text: mockMessages[0].text,
                createdAt: mockMessages[0].createdAt,
                updatedAt: String(mockMessages[0].updatedAt),
            },
            {
                chatId: mockMessages[0].chatId,
                senderId: mockMessages[1].senderId,
                text: mockMessages[1].text,
                createdAt: mockMessages[1].createdAt,
                updatedAt: String(mockMessages[1].updatedAt),
            }
        ]

        expectedQueryResponse = { $metadata: { httpStatusCode: 200 } }

        mockGetMessagesByChatId.mockResolvedValue(expectedMessages)
        mockAddMessagesToDb.mockResolvedValue(expectedQueryResponse)
    })

    describe('When getChatMessages is called', () => {
        it('should return list of messages', async () => {
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { chatId: mockMessages[0].chatId }
            })

            const response = await getChatMessages(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(200, expectedMessages, { "Access-Control-Allow-Origin": "example.com" })

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 when no messages are found', async () => {
            mockGetMessagesByChatId.mockResolvedValue([])

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { chatId: mockMessages[0].chatId }
            })

            let response = await getChatMessages(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                404,
                "Not Found: Chat messages not found!",
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

            mockGetMessagesByChatId.mockClear()
            // DynamoDB NotFoundException

            mockGetMessagesByChatId.mockRejectedValueOnce(
                new ResourceNotFoundException({
                    $metadata: { httpStatusCode: 404 },
                    message: "Not Found"
                }))

            response = await getChatMessages(event)

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 when there is an unknown server or DB error.', async () => {
            const errorName = "Unknown Error From DB";
            const errorMessage = "Something happened over here...";

            mockGetMessagesByChatId.mockRejectedValueOnce(
                new DynamoDBServiceException({
                    $metadata: { httpStatusCode: 404 },
                    $fault: "client",
                    name: errorName,
                    message: errorMessage
                }))

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { chatId: mockMessages[0].chatId }
            })

            const response = await getChatMessages(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

        })
    })

    describe('When addChatMessages is called', () => {
        it('should add messages and notify client.', async () => {
            const chatId = mockMessages[0].chatId;
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { chatId },
                body: JSON.stringify([{
                    ...mockMessages[0],
                    text: "Im here brodie",
                    senderId: mockMessages[1].senderId
                }])
            })

            const response = await addChatMessages(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                200,
                `Added messages to chat: ${chatId}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 when there is an unknown server or DB error.', async () => {
            const errorName = "Unknown Error From DB";
            const errorMessage = "Something happened over here...";

            mockAddMessagesToDb.mockRejectedValueOnce(
                new DynamoDBServiceException({
                    $metadata: { httpStatusCode: 500 },
                    $fault: "client",
                    name: errorName,
                    message: errorMessage
                }))

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { chatId: mockMessages[0].chatId },
                body: JSON.stringify({
                    ...mockMessages[0],
                    text: "Im here brodie",
                    senderId: mockMessages[1].senderId
                })
            })

            const response = await addChatMessages(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

        })
    })
})