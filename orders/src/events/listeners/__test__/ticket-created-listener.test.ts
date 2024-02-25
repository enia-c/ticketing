import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@enia0x63/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener} from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';


const setup = async () => {
    const listener = new TicketCreatedListener(natsWrapper.client)

    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg};

}

it('チケットを作成して保存', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);

});


it('メッセージにack', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});