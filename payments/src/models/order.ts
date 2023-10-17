import mongoose from "mongoose";
import {OrderStatus} from '@aebsorg/common'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

interface OrderAttrs {
    id: string;     //we are including the id property since the Order model is the sub-model inside the payments service and while building, we need to have the id inorder to keeep the uniformity of orders in Order service and Pyaments service
    version: number;
    userId: string;
    price: number;
    status: OrderStatus
}

interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    price: number;
    status: OrderStatus
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs) : OrderDoc
}

const orderSchema = new mongoose.Schema({   //we are not including the version field, since the version is controlled by the updateifcurrent package we installed and mongoose
    userId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,   //even though it belongs to the enum orderstatus, when we take care of the type that should be string
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

//setting the version key to version
orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        status: attrs.status,
        price: attrs.price,
        userId: attrs.userId
    })

}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export {
    Order
}