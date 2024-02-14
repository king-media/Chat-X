import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { type User, type OauthTokenResponse, isBlank, Status, isNotBlank, stringifyDbUserName } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight'
import { addUser, queryUserByName } from '../../services/users'
import { testTokenRequest } from '../../utils/test-utils'
import { handleApiErrors } from '../../utils'

import { v4 as uuidv4 } from 'uuid';
import { AES as crypto, enc as encoder } from 'crypto-js'
// NOTE: Save encrypted passwords in DB whenever the password is needed we decrypt in the server 
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

    if (isNotBlank(process.env.JEST_WORKER_ID)) {
        return testTokenRequest()
    }

    const signTokenResponse = await fetch(tokenUrl, {
        headers: { 'content-type': 'application/json' },
        method: "POST",
        body: JSON.stringify(tokenRequestBody)
    })

    return signTokenResponse
}

export const signInLambda = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    let requestOrigin

    try {
        requestOrigin = String(event.headers.origin)
        const requestBody = JSON.parse(String(event.body))

        console.log('validating user credentials from DB')

        const user = await queryUserByName(requestBody.username, Status.OFFLINE)

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

        const userPassword = crypto.decrypt(String(user?.password), String(process.env.CRYPTO_SECRET))

        if (requestBody.password !== userPassword.toString(encoder.Utf8)) {
            console.log("Error: DB password and client password do not match!")
            return {
                statusCode: 401,
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
        const payloadUser: User = {
            id: user?.id,
            connectionId: user?.connectionId,
            createdAt: user?.createdAt,
            username: user?.username,
            email: user?.email,
            chatRooms: user?.chatRooms
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({
                data: { ...tokenInfo, user: payloadUser }
            }),
        }
    } catch (e) {
        console.log('Error creating token', e)
        return handleApiErrors(e, requestOrigin, "User")
    }
}

export const signUpLambda = async (event): Promise<APIGatewayProxyResultV2> => {
    let requestOrigin

    try {
        requestOrigin = String(event.headers.origin)
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
        const encryptedPassword = crypto.encrypt(String(requestBody.password), String(process.env.CRYPTO_SECRET))
        const user: User = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            email: requestBody.email,
            username: stringifyDbUserName(requestBody.username, requestBody.email),
            password: encryptedPassword.toString(),
            chatRooms: []
        }

        console.log('Attempting to add new user', JSON.stringify(user))

        const addUserResponse = await addUser(user)

        console.log('Added user to DB', JSON.stringify(addUserResponse))

        const payloadUser: User = {
            id: user.id,
            connectionId: "",
            createdAt: user.createdAt,
            username: user.username,
            email: user.email,
            chatRooms: []
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: { ...tokenInfo, user: payloadUser } }),
        }
    } catch (e) {
        console.log('Error creating token', e)
        return handleApiErrors(e, requestOrigin, "User")
    }
}