import {Publisher, Subjects, TicketUpdatedEvent} from '@aebsorg/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}