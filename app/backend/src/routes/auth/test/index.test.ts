import type { APIGatewayProxyResultV2 } from 'aws-lambda'


import type { User } from '@chatx/shared'

import { mockUser } from "../../../api/test/mocks";
import { createResponse, mockLambdaProxyArgs, tokenInfo, testTokenRequest } from "../../../utils/test-utils"

import { queryUserByName } from '../../../services/users'
import { signInLambda, signUpLambda } from '../index';
import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';

jest.mock('../../../utils/test-utils', () => ({
    _esModule: true,
    ...jest.requireActual('../../../utils/test-utils'),
    testTokenRequest: jest.fn()
}))

jest.mock('../../../services/users', () => ({
    _esModule: true,
    queryUserByName: jest.fn()
}))

const mockQueryUser = queryUserByName as jest.Mock<Promise<User | null>>
const mockTestTokenRequest = testTokenRequest as jest.Mock

describe('SignIn Route', () => {
    let expectedUser, tokenResponse, body

    beforeEach(() => {
        // Reset mock values & set vars
        body = JSON.stringify(mockUser);
        expectedUser = mockUser
        tokenResponse = {
            status: 200,
            body: null,
            json: async () => (tokenInfo)
        }

        mockQueryUser.mockResolvedValue(mockUser)
        mockTestTokenRequest.mockResolvedValue(tokenResponse)
    })

    describe('When SignUp is called', () => {
        it('should return token info and user data', async () => {
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body
            })

            const response = await signUpLambda(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                200,
                { ...tokenInfo, user: expectedUser },
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should catch token request errors and return 401 response', async () => {
            const error = "Failed to get token"
            tokenResponse = {
                ...tokenResponse,
                status: 500,
                json: async () => error
            }

            mockTestTokenRequest.mockResolvedValue(tokenResponse)

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body
            })

            const response = await signUpLambda(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                401,
                `Unauthorized: JWT error - ${error}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 if empty request body', async () => {
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body: undefined
            })

            const response = await signUpLambda(event)
            //@ts-expect-error the statusCode is there trust me
            expect(response.statusCode).toBe(500)
        })
    })

    describe('When SignIn is called', () => {
        it('should return token info and user data.', async () => {
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body
            })

            const response = await signInLambda(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                200,
                { ...tokenInfo, user: expectedUser },
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 if user isn\'t found', async () => {
            mockQueryUser.mockResolvedValue(null)

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body
            })

            const response = await signInLambda(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                404,
                'Unauthorized: User not found!',
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 404 if user password doesn\'t match requested password', async () => {
            body = JSON.stringify({ ...mockUser, password: 'ooogaboogga' })

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body
            })

            const response = await signInLambda(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                401,
                'Unauthorized: User password incorrect',
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })

        it('should return 500 if empty request body', async () => {
            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body: undefined
            })

            const response = await signInLambda(event)
            //@ts-expect-error the statusCode is there trust me
            expect(response.statusCode).toBe(500)
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

            const { event } = mockLambdaProxyArgs({
                headers: { origin: "example.com" },
                body
            })

            const response = await signInLambda(event)
            const expectedResponse: APIGatewayProxyResultV2 = createResponse(
                500,
                `${errorName}: ${errorMessage}`,
                { "Access-Control-Allow-Origin": "example.com" }
            )

            expect(response).toStrictEqual(expectedResponse)
        })
    })
})