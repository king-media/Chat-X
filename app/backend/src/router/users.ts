import express from 'express'
import { authenticateRequest } from '../middlewares/cookie-auth';

import * as db from '../db.json'

import { type User } from '@chatx/shared/types'

const usersRouter = express.Router()

usersRouter.use(authenticateRequest)

usersRouter.get('/', async (req, res) => {
    //@ts-expect-error Will fix req obj type before v1
    const users: User[] = db.users_table.filter(user => user.id !== req.user.id)
    res.send({ data: users })
})

export default usersRouter