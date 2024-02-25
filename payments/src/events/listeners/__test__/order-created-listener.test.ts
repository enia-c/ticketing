import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@enia0x63/common";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);
    // const order = Order.build({
    //     id: new mongoose.Types.ObjectId().toHexString(),
    //     price: 20,
    //     status: OrderStatus.Created,
    //     userId: 'abcde',
    //     version: 0
    // });
    // await order.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: 'abcde',
        expiresAt: 'afealfjalf',
        version: 0,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 20,
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg};
}


it('replicates the order info', async () => {
    const {listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);
    expect(order!.price).toEqual(data.ticket.price);
});


it('ack the message', async () => {
    const {listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});