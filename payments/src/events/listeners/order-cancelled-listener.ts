import { Listener, OrderCancelledEvent, OrderCreatedEvent, OrderStatus, Subjects } from "@enia0x63/common";

import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject =  Subjects.OrderCancelled;
    queueGroupName: string = queueGroupName
    
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {

        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if(!order) {
            return;
            //throw new Error('Order not found');
        }

        order.status = OrderStatus.Cancelled;
        await order.save();
        msg.ack();
    }

}