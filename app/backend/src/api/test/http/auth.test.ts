import { createResponse, mockLambdaProxyArgs } from "../../../utils/test-utils";
import { AuthRoutes, handler } from "../../http/auth";
import { signInLambda, signUpLambda } from "../../../routes/auth";

import type { APIGatewayProxyResultV2 } from "aws-lambda";


jest.mock("../../../routes/auth", () => ({
    __esModule: true,
    signInLambda: jest.fn(),
    signUpLambda: jest.fn()
}))

const mockSignIn = signInLambda as jest.Mock<Promise<APIGatewayProxyResultV2>>
const mockSignUp = signUpLambda as jest.Mock<Promise<APIGatewayProxyResultV2>>

describe('SignUp Route Handler', () => {
    let expectedSignupResponse
    beforeEach(() => {
        expectedSignupResponse = createResponse(200, { access_token: "validdude" })

        mockSignIn.mockResolvedValue(expectedSignupResponse)
        mockSignUp.mockResolvedValue(expectedSignupResponse)
    })

    describe(`When ${AuthRoutes.SignInEvent} is called`, () => {
        it('should return success.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: AuthRoutes.SignInEvent })
            const response = await handler(event, context, () => { })

            expect(mockSignIn).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedSignupResponse)
        })
    })

    describe(`When ${AuthRoutes.SignUpEvent} is called`, () => {
        it('should return success.', async () => {
            const { event, context } = mockLambdaProxyArgs({ routeKey: AuthRoutes.SignUpEvent })
            const response = await handler(event, context, () => { })

            expect(mockSignUp).toHaveBeenCalledWith(event)
            expect(response).toEqual(expectedSignupResponse)
        })
    })

    it('should return 404 bad request for incorrect route or other potential error', async () => {
        const { event, context } = mockLambdaProxyArgs({ routeKey: "GET /auth" })

        const response = await handler(event, context, () => { })

        expect(response).toStrictEqual(
            createResponse(404, 'Route undefined! Please request a signin or signup route.', {
                "Access-Control-Allow-Origin": String(event.headers.origin)
            }))
    })
})