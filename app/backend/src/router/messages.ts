import express from 'express'
import { authenticateRequest } from '../middlewares/cookie-auth';
import * as db from '../db.json'

import type { Message } from '@chatx/shared/types'

const messagesRouter = express.Router()

messagesRouter.use(authenticateRequest)

const invalidChatId = (chatId: string) =>
    db.chats_table.some(chat => chat.id === chatId)

messagesRouter.get('/:chatId', async (req, res) => {
    const { chatId } = req.params

    if (!invalidChatId(chatId)) {
        return res.status(400).send({ data: "Invalid chat ID. Chat not found." })
    }

    const messages: Message[] = db.messages_table.filter(message => message.chatId === chatId)
    res.send({ data: messages })
})

messagesRouter.post('/:chatId', async (req, res) => {
    const { chatId } = req.params
    const date = new Date().toISOString()

    if (!invalidChatId(chatId)) {
        return res.status(400).send({ data: "Invalid chat ID. Chat not found." })
    }

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