import express, {Request, Response} from 'express'
import {body} from 'express-validator'
import {validateRequest, BadRequestError} from '@aebsorg/common'
import { User } from '../models/user'
import { Password } from '../services/password'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/api/users/signin', 
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
    ], validateRequest,
    async (req: Request, res: Response) => {
        
        const {email, password} = req.body
        const existingUser = await User.findOne({email})

        if(!existingUser) {
            throw new BadRequestError('Invalid credentials')
        }

        const passwordsMatch = await Password.compare(existingUser.password, password)
        if(!passwordsMatch) {
            throw new BadRequestError('Invalid credentials')
        }

        //generate a jwt
        const userJwt = jwt.sign({  
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!)    //the '!' mark here defines that, we have already taken care of ensuring the presence of JWT_KEY in the start function in the index.ts file, so you can avoid giving error message on that

        //store it on the session object (cz automatically anything comes in req.session will update in cookies)
        req.session = {  
            jwt: userJwt
        }

        res.status(200).send(existingUser)
       
})

export {router as signinRouter} 