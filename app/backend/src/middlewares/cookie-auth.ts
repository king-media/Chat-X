import jwt from 'jsonwebtoken'

import { unAuthError } from '@whatsapp/shared'
import { type Response, type NextFunction } from 'express'
import { type Request } from '../types'

export const authenticateRequest = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token

    try {
        const user = jwt.verify(token, <jwt.Secret>process.env.JWT_SECRET)
        req.user = user
        next()
    } catch (e) {
        res.clearCookie("token")
        return res.status(401).send(unAuthError)
    }
}