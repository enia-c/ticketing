import { Publisher, Subjects, OrderCancelledEvent } from '@enia0x63/common'



export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}