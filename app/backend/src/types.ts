import { type Request as ExpressRequest } from 'express'
import { type JwtPayload } from 'jsonwebtoken'

export type Request = ExpressRequest & { user?: string | JwtPayload }