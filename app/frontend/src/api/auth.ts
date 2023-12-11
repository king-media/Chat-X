import { FormBody } from "~/api/types"
import { fetchApi } from "./helpers/fetch"

import { type User } from "@chatx/shared/types"

export const authenticate = async (isSignIn: boolean, body: FormBody) => {
    try {
        const user = await fetchApi<User>(`/auth?signin=${isSignIn}`, {
            method: "POST",
            body: JSON.stringify(body)
        })

        return user
    } catch (e) {
        console.log(e)
        alert('Oops there was an error with attempting to login. Please try again later.')
    }
}