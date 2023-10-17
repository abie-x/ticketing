import { natswrapper } from "./nats-wrapper"
import { OrderCreatedListener } from "./events/listeners/order-created-listener"

const start = async() => {

    if(!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined!')    
    }
    if(!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined!')    
    }
    if(!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined!')    
    }
    

    try {
        await natswrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)  //go to infra/nats => we have given an args section nd the CID is ticketing. thats why we are using it.also the thing is the client_id must be unique for each clients and that why we are copying the pod name and thats the steps within tickets-depl.yaml inside env section NATS_CLIENT_ID (We give value that way)

        natswrapper.client.on('close', () => {
            console.log('NATS Connection closed!')
            process.exit()
        })

        process.on('SIGINT', () => natswrapper.client.close())
        process.on('SIGTERM', () => natswrapper.client.close())

        new OrderCreatedListener(natswrapper.client).listen()

    } catch(err) {
        console.error(err)
    }

}

start()

