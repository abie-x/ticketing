import { TicketUpdatedListener } from "../ticket-updated-event"
import { TicketUpdatedEvent } from "@aebsorg/common"
import { natswrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"
import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'

const setup = async () => {
    //create a listener
    const listener = new TicketUpdatedListener(natswrapper.client)

    //create a ticket and save it
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'BTS concert',
        price: 499
    })
    await ticket.save()

    //create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 799,
        userId: '1233'
    }

    //create a fake msg object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    //return  listener, data, ticket and msg
    return {ticket, listener, data, msg}
}

it('finds, updates and saves ticket', async () => {
    const {listener, data, ticket, msg} = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
    const {listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('doesnot call the ack function if the event has skipped a version number', async () => {
    const {listener, ticket, data, msg} = await setup()

    data.version = 10

    try {
        await listener.onMessage(data, msg)
    } catch(err) {

    }

    expect(msg.ack).not.toHaveBeenCalled()
    
})