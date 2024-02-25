import { Message } from 'node-nats-streaming';
import { Subjects,Listener, TicketCreatedEvent } from '@enia0x63/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject =  Subjects.TicketCreated;

    queueGroupName: string = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {

        console.log("Ticket Craeted Event Received", data);
        
        const { id, title, price } = data;
        const exist = Ticket.findById(id);
        if(!!exist) {
            console.log('ticket exist!', exist);
            msg.ack();
            return;
        } 
        const ticket = Ticket.build({
            id, title, price
        });
        await ticket.save();
        msg.ack();
    }
}