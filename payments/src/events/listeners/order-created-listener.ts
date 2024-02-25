import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@enia0x63/common";

import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject =  Subjects.OrderCreated;
    queueGroupName: string = queueGroupName
    
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        // const exist = Order.findById(data.id);
        // if(!!exist) {
        //     console.log('order exist!', exist);
        //     msg.ack();
        //     return;
        // } 

        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });
        await order.save();
        msg.ack();
    }

}