import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import cookieSession from 'cookie-session'
import {errorHandler, NotFoundError, currentUser} from '@aebsorg/common'
import mongoose from 'mongoose'
import { createTicketRouter } from './routes/new'
import { showTicketRouter } from './routes/show'
import { indexTicketRouter } from './routes'
import { updateTicketRouter } from './routes/update'

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

app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(indexTicketRouter)
app.use(updateTicketRouter)

app.all('*', async () => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}