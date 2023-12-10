import { FormBody } from "~/api/types"
import { fetchApi } from "./helpers/fetch"

export const authenticate = async (isSignIn: boolean, body: FormBody) => {
    try {
        await fetchApi(`/auth?signin=${isSignIn}`, {
            method: "POST",
            body: JSON.stringify(body)
        })
    } catch (e) {
        console.log(e)
        alert('Oops there was an error with attempting to login. Please try again later.')
    }
}