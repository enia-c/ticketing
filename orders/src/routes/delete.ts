import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, validateRequest , OrderStatus, BadRequestError, NotAuthorizedError} from '@enia0x63/common';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();


router.delete('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('ticket');

    if(!order) {
        throw new NotFoundError();
    }

    if(order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Order作成完了イベント
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        userId: order.userId,
        ticket: {
            id: order.ticket.id,
        }
    });

    res.status(204).send(order);
})

export { router as deleteOrderRouter };