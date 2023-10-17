import express, {Request, Response} from 'express'
import {body} from 'express-validator'
import {requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus} from '@aebsorg/common'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { natswrapper } from '../nats-wrapper'

//create a new express router
const router = express.Router()

router.post('/api/payments', requireAuth, 
    [
        body('token')
            .not()
            .isEmpty(),
        body('orderId')
            .not()
            .isEmpty()
    ], validateRequest, async (req: Request, res: Response) => {
        
        const {token, orderId} = req.body

        //find the order the user is trying to pay for
        const order = await Order.findById(orderId)

        if(!order) {
            throw new NotFoundError()
        }

        if(order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError()
        }

        if(order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for a cancelled order')
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100, //we need to convert to the smallest(so dollars -> cents, rupees => paise)
            source: token
        })

        const payment = Payment.build({
            orderId,
            stripeId: charge.id
        })
        await payment.save()

        new PaymentCreatedPublisher(natswrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        })

        res.status(201).send({id: payment.id})

})

export {router as createChargeRouter}