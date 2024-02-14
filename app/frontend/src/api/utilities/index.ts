import { isString } from "@chatx/shared"
import type { FetchResponse } from "~src/api/types"
import { navigateToErrorPage } from "~src/main"
import { getCurrentUser } from "../auth"

export const fetchApi = async <T>(endpoint?: string, options?: RequestInit): Promise<T> => {
    const currentUser = getCurrentUser()
    const response = await fetch(`${import.meta.env.VITE_BASE_API}${endpoint || ''}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentUser?.access_token}`,
        },
        credentials: "include"
    })

    // Handle all error reasons based on status & or message
    if (response.status !== 200) {
        const { data: errorMessage } = await response.json()
        return Promise.reject({ status: response.status, errorMessage })
    }

    const { data } = await response.json()
    return <T>data
}

export const unwrapSettled = <T>(result: PromiseSettledResult<T>): FetchResponse<T> =>
    result.status === 'rejected' ? ({
        data: null,
        status: result.reason?.status || 500,
        error: result.reason?.errorMessage || result.reason
    }) : { data: result.value, status: 200 };

export function handleError(error: FetchResponse<unknown>['error']): void
export function handleError(errors: FetchResponse<unknown>['error'][]): void

export function handleError(errors: unknown) {
    if (Array.isArray(errors)) {
        navigateToErrorPage("_500")
        throw new Error(errors.join(', ').replace(/Error:/g, ''))
    } else if (isString(errors)) {
        navigateToErrorPage("_500")
        throw new Error(errors)
    }
}