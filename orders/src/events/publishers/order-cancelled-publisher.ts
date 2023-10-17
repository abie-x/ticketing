import {Publisher, OrderCancelledEvent, Subjects} from '@aebsorg/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}