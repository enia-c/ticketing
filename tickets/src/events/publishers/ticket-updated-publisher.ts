import { Publisher, Subjects, TicketUpdatedEvent } from '@enia0x63/common'



export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}