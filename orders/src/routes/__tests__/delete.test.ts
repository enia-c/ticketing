import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


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

it('オーダーをキャンセルする', async () => {

    const ticket = await buildTicket();

    const user = global.signin();
    const { body: order } = await createOrder(user, ticket.id);

    await request(app)
    .delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

    const udpatedOrder = await Order.findById(order.id);
    expect(udpatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('オーダーキャンセルイベントを発行する', async () => {

    const ticket = await buildTicket();

    const user = global.signin();
    const { body: order } = await createOrder(user, ticket.id);

    await request(app)
    .delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
