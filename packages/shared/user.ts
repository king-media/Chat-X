import { isNotBlank } from "./guards"

export const dbUserNameRegex = /(?<username>^.*)::(?<email>[^\s@]+@[^\s@]+\.[^\s@]+$)/

export const parseDbUserName = (dbUserName?: string) => {
    if (isNotBlank(dbUserName)) {
        const match = dbUserName.match(dbUserNameRegex)

        if (!match || !match.groups) {
            return dbUserName
        }

        return match.groups?.username
    }

    return ''
}

export const stringifyDbUserName = (dbUserName?: string, email?: string) => {
    if (isNotBlank(dbUserName) && isNotBlank(email)) {
        const match = dbUserName.match(dbUserNameRegex)

        if (!match || !match.groups) {
            return `${dbUserName}::${email}`
        }

        return dbUserName
    }

    return ''
}