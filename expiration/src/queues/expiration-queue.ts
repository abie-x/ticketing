import  Queue  from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
import { natswrapper } from "../nats-wrapper";

//Create an interface thats gonna describe the data thats gonna store in to the job
interface Payload {
    orderId: string;
}

//code to add the job to redis
const expirationQueue = new Queue<Payload>('order:expiration', {     //creating new instance of Queue with having first argument as the name of the queue and second argument as the list of options that needs to be setup.
    redis: {
        host: process.env.REDIS_HOST
    }
})

//code to process a job
expirationQueue.process(async (job) => {
    new ExpirationCompletePublisher(natswrapper.client).publish({
        orderId: job.data.orderId
    })
})

export {
    expirationQueue
}