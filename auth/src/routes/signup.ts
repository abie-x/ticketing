import express, {Request, Response} from 'express'
import {body} from 'express-validator'
import { User } from '../models/user'
import jwt from 'jsonwebtoken'
import {BadRequestError, validateRequest} from '@aebsorg/common'

const router = express.Router()

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be in valid format'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('Password must be between 4 to 20 characters')
] , validateRequest, async (req: Request, res: Response) => {

    const {email, password} = req.body

    const existingUser = await User.findOne({email})

    if(existingUser) {
        throw new BadRequestError('Email already in use')
    }

    const user = User.build({email, password})
    await user.save()       //we are saving the user document to the database  

    //generate a jwt
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!)    //the '!' mark here defines that, we have already taken care of ensuring the presence of JWT_KEY in the start function in the index.ts file, so you can avoid giving error message on that

    //store it on the session object (cz automatically anything comes in req.session will update in cookies)
    req.session = {  
        jwt: userJwt
    }


    res.status(201).send(user)
})

export {router as signupRouter} 