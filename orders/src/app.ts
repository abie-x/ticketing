import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import cookieSession from 'cookie-session'
import {errorHandler, NotFoundError, currentUser} from '@aebsorg/common'
import mongoose from 'mongoose'
import { deleteOrderRouter } from './routes/delete'
import { indexOrderRouter } from './routes'
import { newOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'

const app = express() 
app.set('trust proxy', true)
app.use(json())
app.use(
    cookieSession({
        signed: false,  //we are just disabling the encryption of the cookies cz jwt is already in encrypted format
        secure: process.env.NODE_ENV !== 'test'    //for enabling a secured connection, we should be on an https connection
    })
)
app.use(currentUser)    //in order to extract the jwt and put a currentUser property to see users are authenticated to view specific routes.

app.use(deleteOrderRouter)
app.use(indexOrderRouter)
app.use(newOrderRouter)
app.use(showOrderRouter)

app.all('*', async () => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}