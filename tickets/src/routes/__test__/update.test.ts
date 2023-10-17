import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Ticket } from '../../models/ticket'
import { natswrapper } from '../../nats-wrapper'

it('returns a 404 is the provided id/route doesnt exist', async () => {
    
    const id = new mongoose.Types.ObjectId().toString()
    const cookie = global.signin()

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'test title',
            price: 89
        })
        .expect(404)

})

it('returns a 401 if the user is not authenticated', async () => {

    const id = new mongoose.Types.ObjectId().toString()
    const cookie = global.signin()

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'test title',
            price: 89
        })
        .expect(401)
})

it('returns a 401 is the user doesnt own the ticket', async () => {

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin()) //here we are calling the signin() one time and the other time below this, so that different users are generated and the cookie will be different for both users
        .send({
            title: 'test-title',
            price: 78
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin()) //here we are calling the signin() one time and the other time above this, so that different users are generated and the cookie will be different for both users
        .send({
            title: 'new test-title',
            price: 67
        })
        .expect(401)
})

it('returns a 400 is the user provided an invalid title or price', async () => {

    const cookie = global.signin()
    
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie) //here we are calling the signin() one time and the other time below this, so that different users are generated and the cookie will be different for both users
    .send({
        title: 'test-title',
        price: 78
    })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 100
        })
    .expect(400)

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: -100
        })
    .expect(400)

})

it('updates the ticket provided valid inputs', async () => {
    
    const cookie = global.signin()
    
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie) //here we are calling the signin() one time and the other time below this, so that different users are generated and the cookie will be different for both users
    .send({
        title: 'test-title',
        price: 78
    })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new test-title',
            price: 600
        })
        .expect(200)

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()

    expect(ticketResponse.body.title).toEqual('new test-title')
    expect(ticketResponse.body.price).toEqual(600)

})

it('publishes an event once the ticket is updated', async () => {

    const cookie = global.signin()
    
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie) //here we are calling the signin() one time and the other time below this, so that different users are generated and the cookie will be different for both users
    .send({
        title: 'test-title',
        price: 78
    })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new test-title',
            price: 600
        })
        .expect(200)

    expect(natswrapper.client.publish).toHaveBeenCalled()

})

it('rejects the updates if the ticket is reserved', async () => {
    const cookie = global.signin()
    
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie) //here we are calling the signin() one time and the other time below this, so that different users are generated and the cookie will be different for both users
    .send({
        title: 'test-title',
        price: 78
    })

    const ticket = await Ticket.findById(response.body.id)
    ticket!.set({orderId: new mongoose.Types.ObjectId().toString()})
    await ticket!.save()

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new test-title',
            price: 600
        })
        .expect(400)
})