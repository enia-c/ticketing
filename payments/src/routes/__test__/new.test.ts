import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { OrderStatus } from '@enia0x63/common';
import { stripe } from '../../stripe';

// jest.mock('../../stripe');

it('存在しない注文への支払いは404を返す', async () => {
    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send(({
        token: 'aljelfa',
        orderId: new mongoose.Types.ObjectId().toHexString()
    }))
    .expect(404);
});

it('他人の注文への支払いは401を返す', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: 'aefjljlaea',
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    })
    order.save();

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send(({
        token: 'aljelfa',
        orderId: order.id
    }))
    .expect(401);
});


it('キャンセル済みの注文への支払いは400を返す', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled,
    })
    order.save();

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send(({
        token: 'aljelfa',
        orderId: order.id
    }))
    .expect(400);
});


it('決済に成功したら201を返す', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price,
        status: OrderStatus.Created,
    })
    order.save();

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send(({
        token: 'tok_visa',
        orderId: order.id
    }))
    .expect(201);

    const stripeChages = await stripe.charges.list({limit: 10});
    const stripeChage = stripeChages.data.find(charge => {
        return charge.amount === price
    })

    expect(stripeChage).toBeDefined();
    expect(stripeChage!.currency).toEqual('jpy');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeChage!.id,
    })

    expect(payment).not.toBeNull();
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    // expect(chargeOptions.source).toEqual('tok_visa');
    // expect(chargeOptions.amount).toEqual(order.price);
    // expect(chargeOptions.currency).toEqual('jpy');
});