import request from 'supertest'
import { app } from '../../app'
import { response } from 'express'

it('responds with the details of the current user', async () => {

    const cookie = await global.signin()    //calling the global signin variable to get the cokie and then assigning to a cookie variable to use in the followup request

    //by default in testing the cookies wont be come in the request just like our browsers or postman, since they have built in mechanism for that
    //we decalre a global function in the setup.ts file inorder to set cookie directly
    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(200)
    expect(response.body.currentUser.email).toEqual('test@test.com')
})

it('responds with null if not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200)
    
    expect(response.body.currentUser).toEqual(null)
})