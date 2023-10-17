import request from 'supertest'
import { app } from '../../app'

//describing the signup routes testing
it('returns a 201 status code on successful signup', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'testpassword'
        })
        .expect(201)
})

it('returns a sttaus code of 400 with invalid email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asdfg',
            password: 'testpwd'
        })
        .expect(400)
})

it('returns a status code of 400 with invalid password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'testmail@test.com',
            password: 'p'
        })
        .expect(400)
})

it('returns a status code of 400 if missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({})
        .expect(400)
})

it('returns a status code of 400 if missing email or password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'testmail@gmail.com'
        })
        .expect(400)

    await request(app)
        .post('/api/users/signup')
        .send({
            password: '1234rfr'
        })
        .expect(400)
})

it('disallows duplicate emails to signup', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400)
})

it('sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)
    expect(response.get('Set-Cookie')).toBeDefined()
})