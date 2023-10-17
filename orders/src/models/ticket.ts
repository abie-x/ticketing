import mongoose from "mongoose";
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'
import { Order, OrderStatus } from "./order";

interface TicketAttrs {
    id: string;         //we are including the id property since the Ticket model is the sub-model inside the Order service and while building, we need to have the id inorder to keeep the uniformity of ticket in Order service and Tickets service
    title: string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs) : TicketDoc
    findByEvent(event: {id: string, version: number}): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

//statics method inorder to find the ticket with a previous versiona and a particular id
ticketSchema.statics.findByEvent = (event: {id: string, version: number}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
}

//statics method is how we apply methods to the model directly
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    })
}

//methods property is used when we need to assign methods to documents
ticketSchema.methods.isReserved = async function() {
    //here this refers to the ticket document that we calls for.
    //NB: we cannot use arrow function and can only use function keyword to implement methods 
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })

    return !!existingOrder  //!! this is to ensure it return boolean
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export {Ticket}