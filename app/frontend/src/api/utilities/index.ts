import { ErrorResponse } from "~src/api/types"

export const fetchApi = async <T>(endpoint?: string, options?: RequestInit): Promise<T> => {
    // NOTE: Fix error handling should render 500 page
    const response = await fetch(`${import.meta.env.VITE_BASE_API}${endpoint || ''}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    })

    // Handle all error reasons based on status & or message
    if (response.status !== 200) {
        const { data: errorMessage } = await response.json()
        const error = new Error(errorMessage)

        console.error(error)
        throw error
    }

    const { data } = await response.json()
    return <T>data
}

export const unwrapSettled = <T>(result: PromiseSettledResult<T>): { data: T } | ErrorResponse =>
    result.status === 'rejected' ? ({
        data: null,
        error: result.reason
    }) : { data: result.value };