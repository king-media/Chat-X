import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { Status, isBlank } from '@chatx/shared'
import { corsHeaders } from '../../api/http/preflight'
import { queryUsersByStatus, queryUserByName, getUsersByKeys } from '../../services/users'
import { handleApiErrors } from '../../utils'

export const getUsersByStatus = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        const status = String(event.pathParameters?.status).toUpperCase()
        const userId = event.queryStringParameters?.userId

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

        const users = await queryUsersByStatus(status, userId)

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

export const getUsersByPrimaryKey = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestOrigin = String(event.headers.origin)

    try {
        if (isBlank(event.queryStringParameters?.usersPrimaryKeys)) {
            console.log("Request error: Primary keys were not given.")
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Origin": requestOrigin
                },
                body: JSON.stringify({ data: `Bad Request: Include a list of primary keys.` })
            }
        }

        const userPrimaryKeys: { id: string; }[] = JSON.parse(String(event.queryStringParameters?.usersPrimaryKeys))

        console.log('getting list of user\'s from DB')

        const users = await getUsersByKeys(userPrimaryKeys)

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