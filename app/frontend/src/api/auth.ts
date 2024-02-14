import { FormBody } from "~src/api/types"
import { fetchApi } from "~src/api/utilities"
import { OauthTokenResponse, type User } from "@chatx/shared/types"
import type { CurrentUser } from '~src/api/types'
import { isNotBlank, parseDbUserName } from "@chatx/shared"

export const authenticate = async (isSignIn: boolean, body: FormBody) => {
    try {
        const { access_token, expires_in, user } = await fetchApi<OauthTokenResponse & { user: User }>(`/${isSignIn ? 'signin' : 'signup'}`, {
            method: "POST",
            body: JSON.stringify(body)
        })

        const currentUser = {
            access_token,
            expires_in,
            receiveTime: new Date().getTime(),
            user: { ...user, username: parseDbUserName(user.username) }
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser))

        return currentUser.user
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

export const updateCurrentUser = (user: User) => {
    const currentUser = getCurrentUser()

    if (isNotBlank(currentUser)) {
        const updatedUser = {
            ...currentUser,
            user: {
                ...user,
                username: parseDbUserName(user.username),
            }
        }

        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }
}

export const connectToSocket = (userId: string) => {
    const socketUrl = new URL(`${import.meta.env.VITE_BASE_SOCKET_API}`)

    socketUrl.searchParams.append('userId', userId)
    return new WebSocket(socketUrl)
}