import mongoose from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@enia0x63/common";
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/tickets";
import { Message } from "node-nats-streaming";


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    ticket.orderId = orderId;
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: ticket.id,
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg, orderId }
}

it('チケットのオーダーIDをクリアする', async () => {
    const { listener, ticket, data, msg } = await setup();
    
    await listener.onMessage(data, msg);
    const udpatedTicket = await Ticket.findById(ticket.id);
    expect(udpatedTicket!.orderId).toBeUndefined();
});


it('Ackを返す', async () => {
    const { listener,  data, msg } = await setup();
    
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
    
});

it('チケットアップデートイベントを送り返す', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    
})