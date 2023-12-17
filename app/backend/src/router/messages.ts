import express from 'express'
import { authenticateRequest } from '../middlewares/cookie-auth';
import * as db from '../db.json'

import type { Message } from '@chatx/shared/types'

const messagesRouter = express.Router()

messagesRouter.use(authenticateRequest)

messagesRouter.get('/:chatId', async (req, res) => {
    const messages: Message[] = db.messages_table.filter(message => message.chatId === req.params.chatId)
    res.send({ data: messages })
})

messagesRouter.post('/:chatId', async (req, res) => {
    const { chatId } = req.params
    const date = new Date().toISOString()

    const newMessage = {
        chatId,
        createdAt: date,
        updatedAt: date,
        ...req.body
    };

    db.messages_table.push(newMessage)

    res.send({ data: newMessage })
})

export default messagesRouter