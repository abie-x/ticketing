import { OrderCancelledListener } from "../order-cancelled-listener"
import {OrderStatus, OrderCancelledEvent} from '@aebsorg/common'
import { natswrapper } from "../../../nats-wrapper"
import { Order } from "../../../models/order"
import mongoose from "mongoose"
import {Message} from 'node-nats-streaming'


const setup = async () => {

    //create a new natswrapper client
    const listener = new OrderCancelledListener(natswrapper.client)

    //create a new fake order and save it to db
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toString(),
        status: OrderStatus.Created,
        version: 0,
        price: 99,
        userId:'kjahjdh',
    })
    await order.save()

    //create a new fake data
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'hhdhffj'
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, order, data, msg}

}

it('updates the order', async () => {
    const {listener, data, msg, order} = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)

})

it('acks the message', async () => {
    const {data, msg, order, listener} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})