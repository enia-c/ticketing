import { Publisher, PaymentCreatedEvent, Subjects } from "@enia0x63/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;

}