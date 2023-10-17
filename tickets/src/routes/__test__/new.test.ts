import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natswrapper } from '../../nats-wrapper'    //we are importing the real natswrapper, but jest actually redirects to the fake or mock natswrapper


it('Has a route handler that listens on the route /api/tickets for POST requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
    expect(response.status).not.toEqual(404)
})

it('Can only be accessed if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})

    expect(response.status).toEqual(401)
})

it('returns a status code other than 401 if the user is signed in', async () => {

    const cookie =  global.signin()    //calling the global signin variable to get the cokie and then assigning to a cookie variable to use in the followup request

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({})

    expect(response.status).not.toEqual(401)
})

it('Returns an error if invalid title is provided', async () => {

    const cookie =  global.signin()    //calling the global signin variable to get the cokie and then assigning to a cookie variable to use in the followup request
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 100
        })

    .expect(400)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            price: 100
        })

    .expect(400)

})

it('Returns an error if invalid price is mentioned', async () => {
    const cookie =  global.signin()    //calling the global signin variable to get the cokie and then assigning to a cookie variable to use in the followup request
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'kdhgshdg',
            price: -100
        })

    .expect(400)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'kdhgshdg',
        })

    .expect(400)
})

it('Creates a tiket with valid inputs', async () => {

    let tickets = await Ticket.find({}) //get all the tickets data, but interestingly we delete the collection before each sending the results. so the length should be zero
    expect(tickets.length).toEqual(0)

    const cookie =  global.signin()    //calling the global signin variable to get the cokie and then assigning to a cookie variable to use in the followup request

    let title ='khdgag'
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price: 20
        })
    .expect(201)

    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
    expect(tickets[0].price).toEqual(20)
    expect(tickets[0].title).toEqual(title)
})

it('publishes an event once a new ticket is created', async () => {
    let title ='khdgag'
    const cookie =  global.signin()

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price: 20
        })
    .expect(201)

    expect(natswrapper.client.publish).toHaveBeenCalled()
})