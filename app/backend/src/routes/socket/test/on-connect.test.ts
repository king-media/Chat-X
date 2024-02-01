import type { APIGatewayProxyResultV2 } from 'aws-lambda'

import { PutCommandOutput } from '@aws-sdk/lib-dynamodb'

import { ChatList, User } from '@chatx/shared'

import { mockRooms, mockUser } from "../../../api/test/mocks";
import { createResponse, mockLambdaProxyArgs, mockWebSocketProxyLambda } from "../../../utils/test-utils"

import { addUser } from '../../../services/users'
import { connectHandler } from '../on-connect';
import { DynamoDBServiceException, ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import { validate } from 'uuid';
import { getUserRooms, addUserRoom } from '../../rooms';

jest.mock('../../../services/users', () => ({
    _esModule: true,
    addUser: jest.fn(),
}))

const mockAddUser = addUser as jest.Mock<Promise<PutCommandOutput>>

describe.skip('$Connect Route', () => {
    const connectionId = 'connectx231';
    let expectedResponse, expectedUser

    beforeEach(() => {
        // Reset mock values & set vars
        expectedUser = { ...mockUser }

        delete expectedUser.chatRooms
        expectedResponse = { $metadata: { httpStatusCode: 200 } }

        mockAddUser.mockResolvedValue(expectedResponse)
    })

    describe('When connectHandler is called', () => {
        it('should add new user', async () => {
            const { event } = mockWebSocketProxyLambda((ev) => ({
                eventVals: {
                    ...ev,
                    requestContext: { ...ev.requestContext, connectionId },
                    queryStringParameters: { ...expectedUser, connectionId }
                }
            }))

            const response = await connectHandler(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                200,
                "User added to DB and connection",
            )

            delete expectedResponse.headers["Access-Control-Allow-Origin"]
            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 when no rooms are found', async () => {
            mockAddUser.mockResolvedValue([])

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

            mockAddUser.mockClear()
            // DynamoDB NotFoundException

            mockAddUser.mockRejectedValueOnce(
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

            mockAddUser.mockRejectedValueOnce(
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