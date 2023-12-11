import express from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid';

import * as db from '../db.json'

import { type User } from '@whatsapp/shared/types'
import { userNotFound } from '@whatsapp/shared/constants';

const authRouter = express.Router()

const getUserFromDB = (username: string, password: string): User => {
    // NOTE: Query DB to find the user item that contains either the username or email provided.

    const user = <User>db.users_table.find(user => user.username === username || user.email === username)

    if (user && user.password === password) {
        return user
    }

    throw new Error(userNotFound)
}

authRouter.post('/', async (req, res) => {
    // NOTE: Add logic to find user from DB if ?sigin=true else add user to DB
    let user: User = {
        id: uuidv4(),
        ...req.body,
        creationDate: new Date().toISOString(),
    }

    try {
        if (req.query.sigin === "true") {
            user = getUserFromDB(req.body.username, req.body.password)
        }

        const token = jwt.sign(user, <jwt.Secret>process.env.JWT_SECRET, { expiresIn: '1hr' })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && true,
            maxAge: 3600000
        })

        res.send(user)
    } catch (e) {
        const error = <Error>e
        res.status(404).send(error.message)
    }
})

export default authRouter