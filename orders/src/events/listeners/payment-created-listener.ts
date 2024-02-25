
import { Message } from 'node-nats-streaming';
import { Subjects,Listener, PaymentCreatedEvent, OrderStatus } from '@enia0x63/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject =  Subjects.PaymentCreated;

    queueGroupName: string = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const { id, orderId, stripeId } = data;
     
        const order = await Order.findById(orderId);
        if(!order) {
            throw new Error('order not foundd');
        }

        order!.status = OrderStatus.Complete;
        await order.save();

        msg.ack();
    }
}