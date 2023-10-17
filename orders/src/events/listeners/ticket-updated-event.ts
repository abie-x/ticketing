///the name of this file was ideally ticket-updated-listener
import {Message} from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@aebsorg/common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {

        const {title, price} = data

        const ticket = await Ticket.findByEvent(data)   //findByEvent is a custom function build to the model we implemented in ticket.ts file at the line of 46.

        if(!ticket) {
            throw new Error('Ticket not found!')
        }

        ticket.set({title, price})
        await ticket.save()

        msg.ack()
    }
}