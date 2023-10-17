import express, {Request, Response} from  'express'
import mongoose, { mongo } from 'mongoose'
import {BadRequestError, NotFoundError, requireAuth, validateRequest} from '@aebsorg/common'
import {body} from 'express-validator'
import { Order, OrderStatus } from '../models/order'
import { Ticket } from '../models/ticket'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natswrapper } from '../nats-wrapper'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 1 * 60   //indicating 15 minutes for expiration time.

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))  //this piece of code is used to ensure that the objectId we getting is a valid mongoid
        .withMessage('TicketId must be provided')
], validateRequest, async (req: Request, res: Response) => {

    const {ticketId} = req.body

    //find the ticket that the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)
    if(!ticket) {
        throw new NotFoundError()
    }

    //make sure that the ticket is already not reserved
    const isReserved = await ticket.isReserved()
    if(isReserved) {
        throw new BadRequestError('Ticket is already reserved')
    }

    //calculate the expiration date for this order
    const expiration =  new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    //build the order and save it to the database
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    })
    await order.save()

    //publish an event saying that the event was created
    new OrderCreatedPublisher(natswrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),  //we never save the date as date but string while publishing the events
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })

    res.status(201).send(order)
})

export {router as newOrderRouter}