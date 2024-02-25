import { Publisher, Subjects, TicketCreatedEvent } from '@enia0x63/common'



export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}