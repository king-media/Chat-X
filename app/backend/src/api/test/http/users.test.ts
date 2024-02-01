import { createResponse, mockLambdaProxyArgs } from "../../../utils/test-utils";
import { UsersRouteKeys, handler } from "../../http/users";
import { getUserByUsername, getUsersByStatus } from "../../../routes/users";

import { mockUserPrimaries } from "../mocks";
import type { APIGatewayProxyResultV2 } from "aws-lambda";


jest.mock("../../../routes/users", () => ({
    __esModule: true,
    getUsersByStatus: jest.fn(),
    getUserByUsername: jest.fn()
}))

const mockGetUsersByStatus = getUsersByStatus as jest.Mock<Promise<APIGatewayProxyResultV2>>
const mockGetUserByUsername = getUserByUsername as jest.Mock<Promise<APIGatewayProxyResultV2>>

describe('Users Route Handler', () => {
    let expectedUsers, expectedUser
    beforeEach(() => {
        expectedUsers = createResponse(200, mockUserPrimaries)
        expectedUser = createResponse(200, mockUserPrimaries[0])

        mockGetUsersByStatus.mockResolvedValue(expectedUsers)
        mockGetUserByUsername.mockResolvedValue(expectedUser)
    })

    describe(`When ${UsersRouteKeys.UsersByStatusEvent} is called`, () => {
        it('should return all users.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: UsersRouteKeys.UsersByStatusEvent })
            const response = await handler(event, context, () => { })

            expect(mockGetUsersByStatus).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedUsers)
        })
    })

    describe(`When ${UsersRouteKeys.UserByName} is called`, () => {
        it('should return user.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: UsersRouteKeys.UserByName })
            const response = await handler(event, context, () => { })

            expect(mockGetUserByUsername).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedUser)
        })
    })

    it('should return 404 bad request for incorrect route or other potential error', async () => {
        const { event, context } = mockLambdaProxyArgs({ routeKey: "GET /rooms" })

        const response = await handler(event, context, () => { })

        expect(response).toStrictEqual(
            createResponse(404, 'Route undefined! Please request a user route.', {
                "Access-Control-Allow-Origin": String(event.headers.origin)
            }))
    })
})