import mongoose from "mongoose"
import {Message} from 'node-nats-streaming'
import {OrderStatus, ExpirationCompleteEvent} from '@aebsorg/common'
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import { natswrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"
import { Order } from "../../../models/order"

const setup = async () => {
    //create a new instance of expirationcomplete listener
    const listener = new ExpirationCompleteListener(natswrapper.client)

    //create a new Ticket and save it
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'BTS concert',
        price: 677
    })
    ticket.save()

    //build the order and save it
    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'jhdgdjh',
        expiresAt: new Date(),
        ticket,
    })
    await order.save()

    //create a fake data 
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    //create a fake msg
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, ticket, order}

}

it('updates the order status', async () => {
    const {listener, data, msg, order} = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
    const {listener, data, msg, order} = await setup()

    await listener.onMessage(data, msg);

    expect(natswrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse((natswrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(eventData.id).toEqual(order.id)
})

it('acks the message', async () => {
    const {listener, data, msg} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})