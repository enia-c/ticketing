import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

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

it('オーダーを取得する', async () => {

    const ticket = await buildTicket();

    const user = global.signin();
    const { body: order } = await createOrder(user, ticket.id);


    const res = await request(app)
    .get(`/api/orders/${order.id}`).set('Cookie', user).send().expect(200);

    expect(res.body.id).toEqual(order.id);
});


it('別のユーザのオーダーを取得するとエラーになる', async () => {

    const ticket = await buildTicket();

    const user = global.signin();
    const { body: order } = await createOrder(user, ticket.id);


    const res = await request(app)
    .get(`/api/orders/${order.id}`).set('Cookie', global.signin()).send().expect(401);
});