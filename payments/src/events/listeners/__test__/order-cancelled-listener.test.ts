import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@enia0x63/common";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Created,
        userId: 'abcde',
        version: 0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        userId: order.userId,
        version: order.version + 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, data, msg};
}


it('updates the status of the order', async () => {
    const {listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('ack the message', async () => {
    const {listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});