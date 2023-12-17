import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import authRouter from './router/auth'
import chatsRouter from './router/chats'
import usersRouter from './router/users'

import 'dotenv/config'
import messagesRouter from './router/messages'
// Change productions origin once both staging & prod envs are deployed.
export const inProduction = process.env.NODE_ENV === "production"
export const origin = inProduction ? "*" : "http://localhost:5173"
export const port = process.env.PORT || 3000

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

app.use('/api/auth', authRouter)
app.use('/api/chats', chatsRouter)
app.use('/api/users', usersRouter)
app.use('/api/messages', messagesRouter)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
