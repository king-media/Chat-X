import type { APIGatewayProxyResultV2 } from 'aws-lambda'

import { PutCommandOutput } from '@aws-sdk/lib-dynamodb'

import { ChatList } from '@chatx/shared'

import { mockRooms } from "../../../api/test/mocks";
import { createResponse, mockLambdaProxyArgs } from "../../../utils/test-utils"

import { getChatList, addChatRoom } from '../../../services/rooms'
import { getUserRooms, addUserRoom } from '../index';
import { DynamoDBServiceException, ResourceNotFoundException } from '@aws-sdk/client-dynamodb';

import { validate } from 'uuid';

jest.mock('../../../services/rooms', () => ({
    _esModule: true,
    getChatList: jest.fn(),
    addChatRoom: jest.fn()
}))

const mockGetChatList = getChatList as jest.Mock<Promise<ChatList>>
const mockAddChatRoom = addChatRoom as jest.Mock<Promise<PutCommandOutput>>

describe('Rooms Route', () => {
    const requestedChat = [{ id: mockRooms[0].chat.id, createdAt: mockRooms[0].chat.createdAt }];
    let expectedQueryResponse, expectedRooms

    beforeEach(() => {
        // Reset mock values & set vars
        expectedRooms = [
            mockRooms[0]
        ]

        expectedQueryResponse = { $metadata: { httpStatusCode: 200 } }

        mockGetChatList.mockResolvedValue(expectedRooms)
        mockAddChatRoom.mockResolvedValue(expectedQueryResponse)
    })

    describe('When getChatList is called', () => {
        it('should return list of chat rooms', async () => {
            const requestedChat = [{ id: mockRooms[0].chat.id, createdAt: mockRooms[0].chat.createdAt }];
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { userId: "send1" },
                queryStringParameters: {
                    chats: JSON.stringify(requestedChat)
                }
            })

            const response = await getUserRooms(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(200, expectedRooms, { "Access-Control-Allow-Origin": "example.com" })

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 when no rooms are found', async () => {
            mockGetChatList.mockResolvedValue([])

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { userId: "send1" },
                queryStringParameters: {
                    chats: JSON.stringify(requestedChat)
                }
            })

            let response = await getUserRooms(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                404,
                "Not Found: Chat room not found!",
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

            mockGetChatList.mockClear()
            // DynamoDB NotFoundException

            mockGetChatList.mockRejectedValueOnce(
                new ResourceNotFoundException({
                    $metadata: { httpStatusCode: 404 },
                    message: "Not Found"
                }))

            response = await getUserRooms(event)

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 when there is an unknown server or DB error.', async () => {
            const errorName = "Unknown Error From DB";
            const errorMessage = "Something happened over here...";

            mockGetChatList.mockRejectedValueOnce(
                new DynamoDBServiceException({
                    $metadata: { httpStatusCode: 404 },
                    $fault: "client",
                    name: errorName,
                    message: errorMessage
                }))

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { userId: "send1" },
                queryStringParameters: {
                    chats: JSON.stringify(requestedChat)
                }
            })

            const response = await getUserRooms(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

        })
    })

    describe('When addUserRoom is called', () => {
        it('should add new chat room and notify client.', async () => {
            const body = mockRooms[0].chat.users;
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { userId: "send1" },
                body: JSON.stringify(body)
            })

            const response = await addUserRoom(event)
            //@ts-expect-error the body is there trust me
            const responseBody = JSON.parse(response.body)

            expect(responseBody.data.users).toStrictEqual(body)
            // confirm new uid
            expect(validate(responseBody.data.id)).toBeTruthy()
        })

        it('should return 500 when there is an unknown server or DB error.', async () => {
            const errorName = "Unknown Error From DB";
            const errorMessage = "Something happened over here...";

            mockAddChatRoom.mockRejectedValueOnce(
                new DynamoDBServiceException({
                    $metadata: { httpStatusCode: 500 },
                    $fault: "client",
                    name: errorName,
                    message: errorMessage
                }))

            const body = mockRooms[0].chat.users;
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                pathParameters: { userId: "send1" },
                body: JSON.stringify(body)
            })

            const response = await addUserRoom(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

        })
    })
})