//this script is dedicated for listening the events
import nats from 'node-nats-streaming'
import {randomBytes} from 'crypto'
import { TicketCreatedListener } from './events/ticket-created-listener'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {     //we are generating a random client id in order to take multiple copies of the listener without the same client-id
    url: 'http://localhost:4222'
})

stan.on('connect', () => {
    console.log('Listener connected to NATS')

    stan.on('close', () => {
        console.log('NATS Connection closed!')
        process.exit()
    })

    new TicketCreatedListener(stan).listen()
})

process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())





