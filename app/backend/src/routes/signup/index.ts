import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'


import { type User, type OauthTokenResponse, isBlank, Status } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight'
import { queryUser } from '../../utils'

const fetchToken = async () => {
    const tokenUrl = String(process.env.JWT_TOKEN_URL)
    const audience = process.env.JWT_AUDIENCE
    const clientId = process.env.JWT_CLIENT_ID
    const clientSecret = process.env.JWT_CLIENT_SECRET

    const tokenRequestBody = {
        "client_id": clientId,
        "client_secret": clientSecret,
        "grant_type": "client_credentials",
        audience
    }

    const signTokenResponse = await fetch(tokenUrl, {
        headers: { 'content-type': 'application/json' },
        method: "POST",
        body: JSON.stringify(tokenRequestBody)
    })

    return signTokenResponse
}

export const signInLambda = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const requestBody = JSON.parse(String(event.body))

        console.log('validating user credentials from DB')

        const user = await queryUser(requestBody.username, Status.OFFLINE)

        if (isBlank(user)) {
            console.log("Error: DB couldn't find user")
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Unauthorized: User not found!' })
            }
        }

        if (requestBody.password !== user?.password) {
            console.log("Error: DB password and client password do not match!")
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin

                },
                body: JSON.stringify({ data: 'Unauthorized: User password incorrect' })
            }
        }

        console.log("fetching token")
        const signTokenResponse = await fetchToken()

        if (signTokenResponse.status !== 200) {
            const error = await signTokenResponse.json()
            console.log("JWT Error: Token not signed - unauthorized", error)
            return {
                statusCode: 401,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: `Unauthorized: JWT error - ${error}` })
            }
        }

        const tokenInfo: OauthTokenResponse = await signTokenResponse.json()

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: { ...tokenInfo, user } }),
        }
    } catch (e) {
        console.log('Error creating token', e)
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: String(e) })
        }
    }
}

export const signUpLambda = async (event): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const requestBody: User = JSON.parse(String(event.body))
        console.log("fetching token")
        const signTokenResponse = await fetchToken()

        if (signTokenResponse.status !== 200) {
            const error = await signTokenResponse.json()
            console.log("JWT Error: Token not signed - unauthorized", error)
            return {
                statusCode: 401,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin

                },
                body: JSON.stringify({ data: `Unauthorized: JWT error - ${error}` })
            }
        }

        const tokenInfo: OauthTokenResponse = await signTokenResponse.json()

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: { ...tokenInfo, user: requestBody } }),
        }
    } catch (e) {
        console.log('Error creating token', e)
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: String(e) })
        }
    }
}