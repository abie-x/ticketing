import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Order, OrderStatus } from "../../models/order"
import { Ticket } from "../../models/ticket"
import { natswrapper } from "../../nats-wrapper"


it('returns an error if the ticket doesnt exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404)

})

it('returns an error if the ticket is already regsitered', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20
    })
    await ticket.save()

    const order = Order.build({
        ticket,
        userId: 'jhdghsgd', //we giving the dummy data to userId and expiresAt only because we need to check whether the ticket is reserved or not, that doiesnt depend on them but only the status property alone.
        status: OrderStatus.Created,    
        expiresAt: new Date()
    })
    await order.save()

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(400)
})

it('reserves a ticket successfully', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20
    })
    await ticket.save()

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201)
})

it('Emits an order created event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20
    })
    await ticket.save()

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201)

    expect(natswrapper.client.publish).toHaveBeenCalled()
})
