import { unAuthError } from "@chatx/shared"

export const fetchApi = async <T>(endpoint?: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${import.meta.env.VITE_BASE_API}${endpoint || ''}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    })

    if (response.status === 401) {
        throw new Error(unAuthError)
    }

    return await response.json()
}