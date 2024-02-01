export const firstLetter = (str: string) => str.split(' ').map(str => str.charAt(0).toUpperCase()).join()

export const removeCommas = (str?: string) => str?.replace(/,/g, '')