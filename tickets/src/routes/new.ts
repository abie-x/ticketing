import express, {Request, Response} from 'express'
import { requireAuth, validateRequest } from '@aebsorg/common'
import {body} from 'express-validator'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { natswrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/tickets', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price should be greater than zero')

], validateRequest, async (req:Request, res:Response) => {
    
    const {title, price} = req.body
    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    })

    await ticket.save()

    //sending the ticket-created-event to other listeners in the application to notify that a new ticket was created
    new TicketCreatedPublisher(natswrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })

    res.status(201).send(ticket)
})

export {router as createTicketRouter}