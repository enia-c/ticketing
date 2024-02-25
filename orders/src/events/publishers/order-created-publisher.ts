import { Publisher, Subjects, OrderCreatedEvent } from '@enia0x63/common'



export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
}