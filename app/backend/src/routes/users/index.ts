import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { Status, isBlank } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight'
import { queryUsers, queryUserByName } from '../../services/users'
import { handleApiErrors } from '../../utils'

export const getUsersByStatus = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const status = String(event.pathParameters?.status).toUpperCase()
        const userId = String(event.queryStringParameters)

        //@ts-expect-error This error is stupid
        if (isBlank(status) || !Object.values(Status).includes(status)) {
            console.log("Request error: Status was not given.", `Given: ${status}, Expected: ${Object.values(Status)}`)
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: `Bad Request: Include a filter status. Options: ${Object.values(Status)}` })
            }
        }

        console.log('getting list of user\'s from DB')

        const users = await queryUsers(userId, status)

        if (isBlank(users)) {
            console.log("DB Error: Users were not found!")
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Not Found: Users were not found!' })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: users })
        }
    } catch (e) {
        console.log('Error getting users', JSON.stringify(e))
        return handleApiErrors(e, requestOrigin, 'Users')
    }

}


export const getUserByUsername = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const username = event.pathParameters?.username
        const status = event.queryStringParameters?.status

        if (isBlank(username)) {
            console.log("Request error: User id was not given.", `Given: ${username}, Expected: String`)
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: "Bad Request: Include a username" })
            }
        }

        console.log('getting list of user\'s from DB')


        const user = await queryUserByName(String(username), status?.toUpperCase() ?? status)

        if (isBlank(user)) {
            console.log("DB Error: User was not found!")
            return {
                statusCode: 404,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: 'Not Found: User were not found!' })
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Origin": requestOrigin
            },
            body: JSON.stringify({ data: user })
        }
    } catch (e) {
        console.log('Error getting user', JSON.stringify(e))
        return handleApiErrors(e, requestOrigin, 'User')
    }
}
