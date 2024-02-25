import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('チケットが存在しなければエラー', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
    .post('/api/orders').set('Cookie', global.signin()).send({ticketId}).expect(404);
});


it('チケットがすでに予約されていたらエラーを返す', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'leajlfajea',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
    .post('/api/orders').set('Cookie', global.signin()).send({ticketId: ticket.id}).expect(400);
});


it('チケットを予約する', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    await request(app)
    .post('/api/orders').set('Cookie', global.signin()).send({ticketId: ticket.id}).expect(201);

});

it('Order Createdイベントを発行する', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    await request(app)
    .post('/api/orders').set('Cookie', global.signin()).send({ticketId: ticket.id}).expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});