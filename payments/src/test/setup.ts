import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose, { connection } from 'mongoose'
import { app } from '../app'
import request from 'supertest'
import jwt from 'jsonwebtoken'

//global variable to know that there is a signin property exists in the global object
declare global {
    var signin: (id?: string) => string[];
}

//fake implementation of nats-wrapper inn order to make the test suits works correctly. proper description of this is provided in __mocks__/nats-wrapper.ts file
jest.mock('../nats-wrapper')

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

    jest.clearAllMocks()    //this is used to clear the mock function before running each tests

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
//we never send a request to /api/users/signup, since we need complete independency between different services in microservices approach. 
global.signin =  (id?: string) => {

    //build a jwt payload {id, email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toString(),
        email: 'test@test.com'
    }

    //create a jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    //build the session object {jwt: MY_JWT}
    const session = {jwt: token}

    //turn that session in to JSON
    const sessionJSON = JSON.stringify(session)

    //take JSON and encode it as base 64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    //returns a string that is an encoded data
    return [`session=${base64}`]
}