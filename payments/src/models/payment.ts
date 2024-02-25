import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@enia0x63/common";

// レコードを追加するときの引数
type PaymentAttrs = {
    orderId: string;
    stripeId: string;
}

// テーブルからレコードを取り出した時のフォーマット
type PaymentDoc = mongoose.Document & PaymentAttrs;


// テーブル
type PaymentModel = mongoose.Model<PaymentDoc> & {
    build: (attrs: PaymentAttrs) => PaymentDoc;
}


const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
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

PaymentSchema.pre('save', async function(done) {
    done();
});

PaymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment({
        orderId: attrs.orderId,
        stripeId: attrs.stripeId
    });
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', PaymentSchema);

export { Payment } ;

