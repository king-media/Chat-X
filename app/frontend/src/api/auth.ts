import { FormBody } from "~src/api/types"
import { fetchApi } from "~src/api/utilities"
import { AES as crypto, enc as encoder } from 'crypto-js'
import { OauthTokenResponse, type User } from "@chatx/shared/types"
import type { CurrentUser } from '~src/api/types'
import { isNotBlank } from "@chatx/shared"

export const authenticate = async (isSignIn: boolean, body: FormBody) => {
    try {
        const { access_token, expires_in, user } = await fetchApi<OauthTokenResponse & { user: User }>(`/${isSignIn ? 'signin' : 'signup'}`, {
            method: "POST",
            body: JSON.stringify(body)
        })

        const currentUser = { access_token, expires_in, receiveTime: new Date().getTime() }

        localStorage.setItem('currentUser', JSON.stringify(currentUser))

        const encryptedPassword = crypto.encrypt(String(user.password), import.meta.env.VITE_CRYPTO_SECRET)

        updateCurrentUser({ ...user, password: encryptedPassword.toString() })

        return { user, socketConnection: connectToSocket(user) }
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
            if (currentUser.user) {
                const decryptPassword = crypto.decrypt(String(currentUser.user?.password), import.meta.env.VITE_CRYPTO_SECRET)
                currentUser.user = {
                    ...currentUser.user,
                    password: decryptPassword.toString(encoder.Utf8)
                }
            }
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
        const updatedUser = { ...currentUser, user }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }
}

export const connectToSocket = (user: User) => {
    const socketUrl = new URL(`${import.meta.env.VITE_BASE_SOCKET_API}`)

    const validUser = Object.entries(user).filter(val => isNotBlank(val))

    // NOTE: Fix how searchParams are set
    validUser.forEach(entry => {
        socketUrl.searchParams.append(entry[0], String(entry[1]))
    })

    return new WebSocket(socketUrl)
}