import request from 'supertest'
import { app } from '../../app'

const createTicket = () => {

    const cookie = global.signin()

    return request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'testtitle',
            price: 300
        })
}

it('can fetch a list os tickets', async () => {

    await createTicket()
    await createTicket()
    await createTicket()

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200)

    expect(response.body.length).toEqual(3)

})