import { createResponse, mockLambdaProxyArgs } from "../../../utils/test-utils";
import { RoomsRouteKeys, handler } from "../../http/rooms";
import { addUserRoom, getUserRooms } from "../../../routes/rooms";

import { mockRooms } from "../mocks";
import type { APIGatewayProxyResultV2 } from "aws-lambda";


jest.mock("../../../routes/rooms", () => ({
    __esModule: true,
    getUserRooms: jest.fn(),
    addUserRoom: jest.fn()
}))

const mockGetUserRooms = getUserRooms as jest.Mock<Promise<APIGatewayProxyResultV2>>
const mockAddUserRoom = addUserRoom as jest.Mock<Promise<APIGatewayProxyResultV2>>

describe('Rooms Route Handler', () => {
    let expectedUserRooms, expectedUserRoom
    beforeEach(() => {
        expectedUserRooms = createResponse(200, mockRooms)
        expectedUserRoom = createResponse(200, { message: "completed" })

        mockGetUserRooms.mockResolvedValue(expectedUserRooms)
        mockAddUserRoom.mockResolvedValue(expectedUserRoom)
    })

    describe(`When ${RoomsRouteKeys.GetRoomsEvent} is called`, () => {
        it('should return all user chats.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: RoomsRouteKeys.GetRoomsEvent })
            const response = await handler(event, context, () => { })

            expect(mockGetUserRooms).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedUserRooms)
        })
    })

    describe(`When ${RoomsRouteKeys.AddRoomEvent} is called`, () => {
        it('should add user chat.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: RoomsRouteKeys.AddRoomEvent })
            const response = await handler(event, context, () => { })

            expect(mockAddUserRoom).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedUserRoom)
        })
    })

    it('should return 404 bad request for incorrect route or other potential error', async () => {
        const { event, context } = mockLambdaProxyArgs({ routeKey: "GET /rooms" })

        const response = await handler(event, context, () => { })

        expect(response).toStrictEqual(
            createResponse(404, 'Route undefined! Please request a room route.', {
                "Access-Control-Allow-Origin": String(event.headers.origin)
            }))
    })
})