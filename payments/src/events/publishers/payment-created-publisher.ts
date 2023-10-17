import {PaymentCreatedEvent, Subjects, Publisher} from '@aebsorg/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}