import type { APIGatewayProxyResultV2 } from 'aws-lambda'


import { Status, type User } from '@chatx/shared'

import { mockUser, mockUsers } from "../../../api/test/mocks";
import { createResponse, mockLambdaProxyArgs } from "../../../utils/test-utils"

import {
    queryUsersByStatus,
    getUsersByKeys,
    queryUserByConnection,
    queryUserByName
} from '../../../services/users'
import { getUserByUsername, getUsersByPrimaryKey, getUsersByStatus } from '../index';
import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';

jest.mock('../../../services/users', () => ({
    _esModule: true,
    queryUserByName: jest.fn(),
    queryUsersByStatus: jest.fn(),
    getUsersByKeys: jest.fn(),
    queryUserByConnection: jest.fn()
}))

const mockQueryUsersByStatus = queryUsersByStatus as jest.Mock<Promise<User[] | null>>
const mockGetUsersByKeys = getUsersByKeys as jest.Mock<Promise<User[] | null>>
const mockQueryUser = queryUserByName as jest.Mock<Promise<User | null>>

describe('Users Route', () => {
    let expectedUsers: User[]

    beforeEach(() => {
        // Reset mock values & set vars;
        expectedUsers = [mockUser]

        mockQueryUsersByStatus.mockResolvedValue(expectedUsers)
        mockGetUsersByKeys.mockResolvedValue(expectedUsers)
        mockQueryUser.mockResolvedValue(mockUser)
    })

    describe('When getUsersByStatus is called', () => {
        it('should return users based on status.', async () => {
            const eventVals = {
                headers: { origin: "example.com" },
                pathParameters: { status: Status.ONLINE },
                queryStringParameters: { id: mockUsers[1].id }
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            let response = await getUsersByStatus(event)
            let expectedResponse: APIGatewayProxyResultV2 = createResponse(
                200,
                expectedUsers,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

            expectedUsers = [mockUsers[1]]
            mockQueryUsersByStatus.mockResolvedValue(expectedUsers)
            eventVals.pathParameters.status = Status.OFFLINE
            eventVals.queryStringParameters.id = mockUsers[0].id

            const { event: event2 } = mockLambdaProxyArgs(eventVals)

            response = await getUsersByStatus(event2)
            expectedResponse = createResponse(
                200,
                expectedUsers,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should throw 400 bad request of no status is given or invalid status given.', async () => {
            const error = `Bad Request: Include a filter status. Options: ${Object.values(Status)}`
            const eventVals = {
                headers: { origin: "example.com" },
                pathParameters: { status: 'not an option' },
                queryStringParameters: { id: mockUsers[1].id }
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            let response = await getUsersByStatus(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                400,
                error,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

            const { event: event2 } = mockLambdaProxyArgs({ ...eventVals, pathParameters: undefined })

            response = await getUsersByStatus(event2)
            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 if no users are found', async () => {
            const error = "Not Found: Users were not found!"
            const eventVals = {
                headers: { origin: "example.com" },
                pathParameters: { status: Status.ONLINE },
                queryStringParameters: { id: mockUsers[1].id }
            }

            mockQueryUsersByStatus.mockResolvedValue(null)

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUsersByStatus(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                404,
                error,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 if DB request fails', async () => {
            const errorName = "Unknown Error From DB";
            const errorMessage = "Something happened over here...";

            mockQueryUsersByStatus.mockRejectedValue(new DynamoDBServiceException({
                $metadata: { httpStatusCode: 500 },
                $fault: "client",
                name: errorName,
                message: errorMessage
            }))

            const eventVals = {
                headers: { origin: "example.com" },
                pathParameters: { status: Status.ONLINE },
                queryStringParameters: { id: mockUsers[1].id }
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUsersByStatus(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })
    })

    describe('When getUsersByPrimaryKey is called', () => {
        it('should return users based on primary keys passed.', async () => {
            const usersPrimaryKeys = expectedUsers.map(user => ({ id: user.id, createdAt: user.createdAt }))
            const eventVals = {
                headers: { origin: "example.com" },
                queryStringParameters: { usersPrimaryKeys: JSON.stringify(usersPrimaryKeys) }
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUsersByPrimaryKey(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                200,
                expectedUsers,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should throw 400 bad request of no primary keys are given or empty users given.', async () => {
            const error = `Bad Request: Include a list of primary keys.`
            const eventVals = {
                headers: { origin: "example.com" },
                queryStringParameters: { usersPrimaryKeys: undefined }
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            let response = await getUsersByPrimaryKey(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                400,
                error,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

            const { event: event2 } = mockLambdaProxyArgs({ ...eventVals, pathParameters: undefined })

            response = await getUsersByPrimaryKey(event2)
            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 if no users are found', async () => {
            const error = "Not Found: Users were not found!"
            const eventVals = {
                headers: { origin: "example.com" },
                queryStringParameters: { usersPrimaryKeys: JSON.stringify(expectedUsers) }
            }

            mockGetUsersByKeys.mockResolvedValue([])

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUsersByPrimaryKey(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                404,
                error,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 if DB request fails', async () => {
            const errorName = "Unknown Error From DB";
            const errorMessage = "Something happened over here...";

            mockGetUsersByKeys.mockRejectedValue(new DynamoDBServiceException({
                $metadata: { httpStatusCode: 500 },
                $fault: "client",
                name: errorName,
                message: errorMessage
            }))

            const eventVals = {
                headers: { origin: "example.com" },
                queryStringParameters: { usersPrimaryKeys: JSON.stringify(expectedUsers) }
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUsersByPrimaryKey(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })
    })

    describe('When getUserByUsername is called', () => {
        it('should return user based on user name.', async () => {
            const eventVals = {
                headers: { origin: "example.com" },
                pathParameters: { username: mockUser.username },
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUserByUsername(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                200,
                mockUser,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)

        })

        it('should return 400 if user isn\'t given', async () => {
            const eventVals = {
                headers: { origin: "example.com" },
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUserByUsername(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                400,
                "Bad Request: Include a username",
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 if user isn\'t found', async () => {
            mockQueryUser.mockResolvedValue(null)

            const eventVals = {
                headers: { origin: "example.com" },
                pathParameters: { username: mockUser.username }
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUserByUsername(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                404,
                'Not Found: User were not found!',
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 if DB request fails', async () => {
            const errorName = "Unknown Error From DB";
            const errorMessage = "Something happened over here...";

            mockQueryUser.mockRejectedValue(new DynamoDBServiceException({
                $metadata: { httpStatusCode: 500 },
                $fault: "client",
                name: errorName,
                message: errorMessage
            }))

            const eventVals = {
                headers: { origin: "example.com" },
                pathParameters: { username: mockUser.username },
            }

            const { event } = mockLambdaProxyArgs(eventVals)

            const response = await getUserByUsername(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })
    })
})