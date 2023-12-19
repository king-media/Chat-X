export const replaceAt = (str: string, replacement: string, index: number) =>
    str.substring(0, index) + replacement + str.substring(index + replacement.length);


export const capitalize = (str: string) => {
    const firstLetter = str.charAt(0).toUpperCase()
    return replaceAt(str, firstLetter, 0)
}

export const firstLetter = (str: string) => str.split(' ').map(str => str.charAt(0).toUpperCase()).join()

export const removeCommas = (str?: string) => str?.replace(/,/g, '')