export const replaceAt = (str: string, replacement: string, index: number) =>
    str.substring(0, index) + replacement + str.substring(index + replacement.length);

export const capitalize = (str: string) => {
    const firstLetter = str.charAt(0).toUpperCase()
    return replaceAt(str, firstLetter, 0)
}

export const camelCase = (str: string, capitalCased: boolean) => {
    const camelCasedStr = str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');

    return capitalCased ? capitalize(camelCasedStr) : camelCasedStr
}
