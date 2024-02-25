import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// データ本体
type TicketAttrs = {
    title: string;
    price: number;
    userId: string;
}

// MongoDB内の1レコード。createdAtなど自動付加される
type TicketDoc = mongoose.Document & TicketAttrs & {
    version: number;
    orderId?: string;
}

// MongoDB内の1テーブル
type TicketModel = mongoose.Model<TicketDoc> & {
    build: (attrs: TicketAttrs) => TicketDoc;
}


const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attr: TicketAttrs) => {
    return new Ticket(attr);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);


export { Ticket};