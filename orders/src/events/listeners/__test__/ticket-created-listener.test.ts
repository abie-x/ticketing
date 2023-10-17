import { TicketCreatedListener } from "../ticket-created-listener"
import { natswrapper } from "../../../nats-wrapper"
import { TicketCreatedEvent } from "@aebsorg/common"
import mongoose, { set } from "mongoose"
import {Message} from 'node-nats-streaming'
import { Ticket } from "../../../models/ticket"

const setup = async () => { //function inorder to avoid duplication of test codes for below 2 test suits.
    //creats an instance of the listener
    const listener = new TicketCreatedListener(natswrapper.client)

    //creates a fake data event
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'BTS Concert',
        price: 999,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    //creates a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg}
}

it('creates and saves a ticket', async () => {

    const {listener, data, msg} = await setup()

    //call the onMessage function with the data and the message
    await listener.onMessage(data, msg)

    //write assertions to make sure that the ticket was created
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {

    const {listener, data, msg} = await setup()

    //call the onMessage function with the data and the message
    await listener.onMessage(data, msg)

    //write assertions to make sure that the ack function is called
    expect(msg.ack).toHaveBeenCalled()
})