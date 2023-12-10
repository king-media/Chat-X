export const replaceAt = (str: string, replacement: string, index: number) =>
    str.substring(0, index) + replacement + str.substring(index + replacement.length);


export const capitalize = (str: string) => {
    const firstLetter = str.charAt(0).toUpperCase()
    return replaceAt(str, firstLetter, 0)
}