import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose, { connection } from 'mongoose'
import { app } from '../app'
import request from 'supertest'

//global variable to know that there is a signin property exists in the global object
declare global {
    var signin: () => Promise<string[]>;
}

let mongo: any

//setup that needs to execute before all tests becomes executed.
beforeAll(async () => {
    process.env.JWT_KEY = 'testkey'

    mongo = await MongoMemoryServer.create()
    const mongoUri = mongo.getUri()

    await mongoose.connect(mongoUri, {})
})

//setup that needs to be executed before each test becomes executed
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections()

    for(let collection of collections) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

//declaring the global function inorder to set the cookie direvtly after sending a signin/signup function
global.signin = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password
        })
        .expect(201)

    const cookie = response.get('Set-Cookie')
    return cookie
}