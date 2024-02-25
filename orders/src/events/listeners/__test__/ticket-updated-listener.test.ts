import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent, TicketUpdatedEvent } from '@enia0x63/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener} from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';


const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client)

    const ticket = Ticket.build({
         id: new mongoose.Types.ObjectId().toHexString(),
         title: 'concdert',
         price: 20
    })
    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'concert2',
        price: 15,
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


it('メッセージの追い越し', async () => {
    const { listener, data, msg } = await setup();

    data.version = data.version + 1;

    try {
        await listener.onMessage(data, msg);
    }
    catch(err) {
    }
    expect(msg.ack).not.toHaveBeenCalled();
});
