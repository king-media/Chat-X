import { FormBody } from "~src/api/types"
import { fetchApi } from "~src/api/utilities"

import { type User } from "@chatx/shared/types"
import type { CurrentUser } from '~src/api/types'

export const authenticate = async (isSignIn: boolean, body: FormBody) => {
    try {
        const user = await fetchApi<User>(`/auth?signin=${isSignIn}`, {
            method: "POST",
            body: JSON.stringify(body)
        })

        const currentUser = { user, receiveTime: new Date().getTime() }

        localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } catch (e) {
        console.error(e)
        alert('Oops there was an error with attempting to login. Please try again later.')
    }
}

export const getCurrentUser = () => {
    const currentTime = new Date().getTime()
    const localUser = localStorage.getItem('currentUser')

    if (localUser) {
        const currentUser: CurrentUser = JSON.parse(localUser)
        if (currentTime - currentUser.receiveTime < 24 * 60 * 60 * 1000) {
            return currentUser
        }

        localStorage.removeItem('currentUser')
        return null
    }

    return null
}