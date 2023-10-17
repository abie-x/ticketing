import {Publisher, OrderCreatedEvent, Subjects} from '@aebsorg/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
}