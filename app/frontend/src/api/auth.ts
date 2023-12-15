import { FormBody } from "~src/api/types"
import { fetchApi } from "~src/api/utilities"

import { type User } from "@chatx/shared/types"

export const authenticate = async (isSignIn: boolean, body: FormBody) => {
    try {
        const user = await fetchApi<User>(`/auth?signin=${isSignIn}`, {
            method: "POST",
            body: JSON.stringify(body)
        })

        localStorage.setItem('currentUser', JSON.stringify(user))
    } catch (e) {
        console.log(e)
        alert('Oops there was an error with attempting to login. Please try again later.')
    }
}