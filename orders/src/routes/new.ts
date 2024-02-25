import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, validateRequest , OrderStatus, BadRequestError} from '@enia0x63/common';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 60 * 15;

const router = express.Router();


router.post('/api/orders', 
    requireAuth,
    [
        body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided')
    ], 
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        // チケット情報が存在することの確認
        const ticket = await Ticket.findById(ticketId);
        if(!ticket) {
            throw new NotFoundError();
        }


        // チケットが予約済みでないことの確認（同時に予約されるケースに備える）
        // キャンセルされていないチケットが存在したら予約されている
        const isReserved = await ticket.isReserved();
        if(isReserved) {
            throw new BadRequestError("Ticket is already reserved");
        }

        // 失効日時の確認
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        // 注文組み立て&Save
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket: ticket
        });
        await order.save();

        // Order作成完了イベント
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        });

        res.status(201).send(order);
    }
);

export { router as createOrderRouter };