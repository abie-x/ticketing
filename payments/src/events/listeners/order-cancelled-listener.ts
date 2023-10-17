import {OrderCancelledEvent, Subjects, OrderStatus, Listener} from '@aebsorg/common'
import { queueGroupName } from './queue-group-name'
import {Message} from 'node-nats-streaming'
import { Order } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
    queueGroupName = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findOne({ //instead we can also use findByEvent custom statics function we used in tickets model in Order service
            _id: data.id,
            version: data.version - 1
        })

        if(!order) {
            throw new Error('Order not found!')
        }

        order.set({status: OrderStatus.Cancelled})
        await order.save()

        msg.ack()
    }
}