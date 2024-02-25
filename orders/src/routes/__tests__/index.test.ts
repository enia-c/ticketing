import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket, TicketDoc } from '../../models/ticket';

const buildTicket = async  () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();
    return ticket;
}

const createOrder = async (user: string[], ticketId: string) => {
    return await request(app).post('/api/orders').set('Cookie', user).send({ticketId});
}

it('ユーザのオーダー一覧を取得する', async () => {

    // const ticketId = new mongoose.Types.ObjectId();
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();
    const ticket3 = await buildTicket();

    const user1 = global.signin();
    const user2 = global.signin();

    const { body: order1 } = await createOrder(user1, ticket1.id);
    const { body: order2 } = await createOrder(user2, ticket2.id);
    const { body: order3 } = await createOrder(user2, ticket3.id);


    const res = await request(app)
    .get('/api/orders').set('Cookie', user2).send().expect(200);

    expect(res.body.length).toEqual(2);
    expect(res.body[0].id).toEqual(order2.id);
    expect(res.body[1].id).toEqual(order3.id);
});
