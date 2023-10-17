import {Subjects, Publisher, ExpirationCompleteEvent} from '@aebsorg/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExirationComplete = Subjects.ExirationComplete
}