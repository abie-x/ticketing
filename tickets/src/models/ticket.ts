import mongoose, { version } from "mongoose";
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

interface TicketAttrs {
    title: string;
    price: number;
    userId: string
}

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;    //include version number to avoid concurrecy issues
    orderId?: string;   //orderId is marked optional since we dont have the order id once the tkcket is created, we have orderid when a new order is created for that particular ticket
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema({  //version is not included in ticketschema since its automatically enhanced by mongoose as version and original version key is __v
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
            delete ret._id
        }
    }
})

ticketSchema.set('versionKey', 'version')   //setup to include the version for concurrency setup
ticketSchema.plugin(updateIfCurrentPlugin)  //setup to include the version for concurrency setup

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export {
    Ticket
}