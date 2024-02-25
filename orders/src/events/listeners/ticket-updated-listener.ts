import { Message } from 'node-nats-streaming';
import { Subjects,Listener, TicketUpdatedEvent } from '@enia0x63/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject =  Subjects.TicketUpdated;

    queueGroupName: string = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const { id, title, price } = data;

        const ticket = await Ticket.findByEvent(data);
        if(!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.title = title;
        ticket.price = price;

        await ticket.save();
        msg.ack();
    }
 

    


}