import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

it('returns 404 is the ticket is not found', async () => {

    const id = new mongoose.Types.ObjectId().toString()

    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404)
})

it('returns the ticket if the ticket is found', async () => {

    const cookie =  global.signin()    //calling the global signin variable to get the cokie and then assigning to a cookie variable to use in the followup request
    const title = 'concert'
    const price = 200

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        })
        .expect(201)

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200)
    expect(ticketResponse.body.title).toEqual(title)
    expect(ticketResponse.body.price).toEqual(price)
})


