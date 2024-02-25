import mongoose from "mongoose";
import { OrderCreatedListener } from "../order-created-listener"
import { OrderCreatedEvent, OrderStatus } from "@enia0x63/common";
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/tickets";
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'sample',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg}
}

it('チケットにOrderIDを設定する', async () => {
    const { listener, ticket, data, msg } = await setup();
    
    await listener.onMessage(data, msg);
    const udpatedTicket = await Ticket.findById(ticket.id);
    expect(udpatedTicket!.orderId).toEqual(data.id);
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

    const ticketUpdateData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketUpdateData.orderId).toEqual(data.id);

    
})