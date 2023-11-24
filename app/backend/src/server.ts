import express, { type Request, type Response } from 'express'
import cors from 'cors'

import { type ChatList } from '@whatsapp/shared/types'
import * as db from './db.json'

const app = express()

app.use(cors())

app.get('/', async (req: Request, res: Response) => {
  // Delete when backend is up
  const chatList: ChatList = db.chat_table

  res.send(chatList)
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
