import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from './order';

// レコードを追加するときの引数
type TicketAttrs = {
    id: string;
    title: string;
    price: number;
}

// テーブルからレコードを取り出した時のフォーマット
export type TicketDoc = mongoose.Document & TicketAttrs & {
    version: number;
    isReserved(): Promise<boolean>;
}


// テーブル
type TicketModel = mongoose.Model<TicketDoc> & {
    build: (attrs: TicketAttrs) => TicketDoc;
    findByEvent: (event: {id: string, version: number}) => Promise<TicketDoc | null>

}


const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
},   {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

schema.pre('save', async function(done) {
    done();
});

schema.set('versionKey', 'version');
schema.plugin(updateIfCurrentPlugin);

schema.statics.findByEvent = (event: { id: string, version: number}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
}


schema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
}

schema.methods.isReserved = async function() {
    const existingOrders = await Order.findOne({
        ticket: this,
        status: {
            $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Created]
        }
    });

    return !!existingOrders;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', schema);

export { Ticket } ;

