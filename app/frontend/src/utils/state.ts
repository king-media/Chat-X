import { User } from "@chatx/shared/types"

export const getCurrentUser = () => {
    const localUser = localStorage.getItem('currentUser')

    if (localUser) {
        return <User>JSON.parse(localUser)
    }
}