import {OrderCreatedEvent, OrderStatus} from '@aebsorg/common'
import { natswrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming'
import { Order } from '../../../models/order';

const setup = async () => {
    //create a new ordercreatedlistener
    const listener = new OrderCreatedListener(natswrapper.client)

    //craete a fake data
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toString(),
        version: 0,
        expiresAt: 'ajhdgajhdgd',
        userId: 'hagagd',
        status: OrderStatus.Created,
        ticket: {
            id: 'haggd',
            price: 789
        }
    }

    //create a fake msg
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg}
}

it('replicates the order info', async () => {
    const {listener, data, msg} = await setup()
    await listener.onMessage(data, msg)

    const order = await Order.findById(data.id)
    expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
    const {listener, data, msg} = await setup()
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})