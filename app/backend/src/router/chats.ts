import express from 'express'
import { authenticateRequest } from '../middlewares/cookie-auth';

import * as db from '../db.json'

import { type ChatList } from '@whatsapp/shared/types'

const chatRouter = express.Router()

chatRouter.use(authenticateRequest)

chatRouter.get('/', async (req, res) => {
    // Delete when backend is up
    const chatList: ChatList = db.users_table

    res.send(chatList)
})

export default chatRouter