import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { Order, OrderStatus } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { PaymentCreatedListener } from "../payment-created-listener";
import { ExpirationCompleteEvent, PaymentCreatedEvent } from "@enia0x63/common";

const setup = async () => {
    const listener = new PaymentCreatedListener(natsWrapper.client);
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const order = Order.build({
        userId: 'abcde', 
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket
    });
    await order.save();

    const data: PaymentCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        orderId: order.id,
        stripeId: 'ejflajelaf'
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, data, msg};
}


it('update the order status to complete', async () => {
    const {listener, order, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});


// it('emit an OrderCancelled event', async () => {
//     const {listener, order, ticket, data, msg } = await setup();
//     await listener.onMessage(data, msg);

//     expect(natsWrapper.client.publish).toHaveBeenCalled();

//     const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
//     expect(eventData.id).toEqual(order.id);

// });

it('ack the message', async () => {
    const {listener, order, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});