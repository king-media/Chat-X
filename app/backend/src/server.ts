import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import authRouter from './router/auth'
import chatRouter from './router/chats'
import usersRouter from './router/users'

import 'dotenv/config'
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
app.use('/api/chats', chatRouter)
app.use('/api/users', usersRouter)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
