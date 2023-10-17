import { Listener, OrderCreatedEvent, Subjects } from "@aebsorg/common";
import { queueGroupName } from "./queue-group-name";
import {Message} from 'node-nats-streaming'
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        const delay = new Date(data.expiresAt).getTime() - new Date().getTime() //substract the expiresat milli seconds from current time
        console.log('waiting this many milli seconds to process the job: ', delay)
    
        //code to add a job to the queue
       await expirationQueue.add({
        orderId: data.id    //this is basically the payload which means what consists inside the job
       }, {
        delay
       })

       msg.ack()
    }
}