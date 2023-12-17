import express from 'express'
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest } from '../middlewares/cookie-auth';
import * as db from '../db.json'

import { isBlank } from '@chatx/shared';
import type { Chat, ChatList, User } from '@chatx/shared/types'

const chatsRouter = express.Router()

const getUserChats = (user: User): ChatList => {
    const chats: Chat[] = db.chats_table
    const users: User[] = db.users_table

    const userChats = chats.filter(chat => chat.users.includes(user.id))

    return userChats.map(chat => {
        const recipientUserIds = chat.users.filter(userId => userId !== user.id)
        const recipientUsers = users.filter(dbUser => recipientUserIds.includes(dbUser.id))

        return {
            chat,
            recipientUsers
        }
    })
}

chatsRouter.use(authenticateRequest)

chatsRouter.get('/', async (req, res) => {
    //@ts-expect-error Will fix req obj type before v1
    const chatList: ChatList = getUserChats(req.user)
    res.send({ data: chatList })
})

chatsRouter.post('/add', async (req, res) => {
    if (isBlank(req.body)) {
        res.status(400).send({ data: 'Must provide users in order to create chat.' })
        return
    }

    const chat: Chat = {
        id: uuidv4(),
        //@ts-expect-error Will fix req obj type before v1
        users: [req.user.id, ...req.body],
        createdAt: new Date().toISOString()
    }

    db.chats_table.push(chat)
    //@ts-expect-error Will fix req obj type before v1
    res.send({ data: getUserChats(req.user) })
})

export default chatsRouter