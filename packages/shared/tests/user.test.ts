import { parseDbUserName } from '../utilities/user'

describe('parseDbUserName tests', () => {
    const dbUserName = "user.name::fakeemail@email.com"
    const username = "user.name"

    it('should return the parsed username w/o email', () => {
        const result = parseDbUserName(dbUserName)
        expect(result).toBe(username)
    })

    it('should fail if dbUserName doesn\'t match', () => {
        const result = parseDbUserName("user.name")
        expect(result).toBe('')
    })

    it('should fail if email doesn\'t match', () => {
        const result = parseDbUserName("user.name::@gmail.com")
        expect(result).toBe("")
    })

    it('should fail if no string is passed', () => {
        const result = parseDbUserName()
        expect(result).toBe('')
    })
})