import { natswrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import { OrderCancelledEvent } from "@aebsorg/common"
import { Ticket } from "../../../models/ticket"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"

const setup = async () => {

    //create a new instance of ordercancelled listener
    const listener = new OrderCancelledListener(natswrapper.client)

    const orderId = new mongoose.Types.ObjectId().toString()

    //build a new ticket and save it
    const ticket = Ticket.build({
        title: 'BTS Concert',
        price: 677,
        userId: 'jhdg'
    })

    //assign a orderId property to the ticket to know that the ticket has reserved by some person and then save it
    ticket.set({orderId})
    await ticket.save()

    //create the fake data
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    //create a fake message
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, ticket, orderId}

}

it('updates the ticket, publishes an event and acks the message', async() => {
    const {data, msg, listener, orderId, ticket} = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
    expect(natswrapper.client.publish).toHaveBeenCalled()
})