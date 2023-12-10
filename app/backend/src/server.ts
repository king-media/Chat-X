import express, { type Request, type Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { authenticateRequest } from './middlewares/cookie-auth'

import { type ChatList } from '@whatsapp/shared'
import * as db from './db.json'

import 'dotenv/config'
// Change productions origin once both staging & prod envs are deployed.
export const origin = process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173"
const port = process.env.PORT || 3000

const app = express()
const corsOptions = {
  credentials: true,
  origin
}

app.use(cors(corsOptions))
app.use(cookieParser())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', authenticateRequest, async (req: Request, res: Response) => {
  // Delete when backend is up
  const chatList: ChatList = db.chat_table

  res.send(chatList)
})

app.post('/auth', async (req: Request, res: Response) => {
  // NOTE: Add logic to find user from DB if ?sigin=true else add user to DB
  const { username, password } = req.body
  const token = jwt.sign({ username, password }, <jwt.Secret>process.env.JWT_SECRET, { expiresIn: '1hr' })

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && true,
    maxAge: 3600000
  })

  res.redirect("/")
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
