import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/order'
import { OrderStatus } from '@aebsorg/common'

jest.mock('../../stripe')

it('returns 404 if the users is trying to  purchase the order that doesnot exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'khagdhgd',
            orderId: new mongoose.Types.ObjectId().toString()
        })
        .expect(404)
})

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toString(),
        price: 99,
        status: OrderStatus.Created
    })
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'khagdhgd',
            orderId: order.id
        })
        .expect(401)

})

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toString()

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toString(),
        version: 0,
        userId,
        price: 99,
        status: OrderStatus.Cancelled
    })
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'jhagdjhahdjad',
            orderId: order.id
        })
        .expect(400)
})

