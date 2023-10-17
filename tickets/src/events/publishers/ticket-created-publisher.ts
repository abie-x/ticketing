import {Publisher, Subjects, TicketCreatedEvent} from '@aebsorg/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated
}