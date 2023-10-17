import { OrderCreatedListener } from "../order-created-listener"
import { OrderCreatedEvent, OrderStatus } from "@aebsorg/common"
import { natswrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"
import mongoose, { set } from "mongoose"
import { Message } from "node-nats-streaming"

const setup = async () => {
    //create an instance of listener
    const listener = new OrderCreatedListener(natswrapper.client)

    //creates and save a ticket
    const ticket = Ticket.build({
        title: 'BTS concert',
        price: 799,
        userId: 'asdfg'
    })
    await ticket.save()

    //create fake data
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'bshcsb',
        expiresAt: 'jhsghjsgf',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    //fake msg
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {ticket, listener, msg, data}

}

it('sets the order id of the ticket', async () => {
    const {listener, data, msg, ticket} = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
    const {listener, data, msg, ticket} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const {listener, data, msg, ticket} = await setup()

    await listener.onMessage(data, msg)

    expect(natswrapper.client.publish).toHaveBeenCalled()
})