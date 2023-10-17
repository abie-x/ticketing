//this script is dedicated for publishing the events
import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

const stan = nats.connect('ticketing', 'abc', {     //abc is the client id of the publisher
    url: 'http://localhost:4222'
})

//after connecting the client emits an event driven function, to establish the action taht should be taken after connecting with the nats streaming server
stan.on('connect', async () => {
    console.log('publisher connected to NATS')

    const publisher = new TicketCreatedPublisher(stan)
    try {
        await publisher.publish({
            id: '123',
            title: 'concert',
            price: 50
        })
    } catch(err) {
        console.error(err)
    }

    //we can only share JSON objects to the NATS streaming server. so we need to JSON.stringify() the data we have right now.
    // const data = JSON.stringify({
    //     id: '1234',
    //     title: 'Concert',
    //     price: 20
    // })

    // stan.publish('ticket:created', data, () => {
    //     console.log('Event published')
    // })
})