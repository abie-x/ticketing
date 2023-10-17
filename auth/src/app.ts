import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import cookieSession from 'cookie-session'
import { currentUserRouter } from './routes/current-user'
import { signinRouter } from './routes/signin'
import { signupRouter } from './routes/signup'
import { signoutRouter } from './routes/signout'
import {errorHandler, NotFoundError} from '@aebsorg/common'
import mongoose from 'mongoose'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
    cookieSession({
        signed: false,  //we are just disabling the encryption of the cookies cz jwt is already in encrypted format
        secure: process.env.NODE_ENV !== 'test'    //for enabling a secured connection, we should be on an https connection
    })
)

app.use(signupRouter)
app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)

app.all('*', async () => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}