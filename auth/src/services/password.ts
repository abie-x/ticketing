import {scrypt, randomBytes} from 'crypto'
import {promisify} from 'util'

const scryptAsync = promisify(scrypt)   //cz scrypt is call-back based and doesnt compatible with asyn-await that are promise. so inorder to make that happen we are using promisify

export class Password {

    //static function that is used to hash the password entered by the user
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex')
        const buf = (await scryptAsync(password, salt, 64)) as Buffer //the buf will be an array. cz scryptAsync returns an array of objects

        return `${buf.toString('hex')}.${salt}`
    }

    //static function that is used to cross check the password with the one that is already stored in the database
    static async compare(storedPassword: string, suppliedPassword: string) {
        const [hashedPassword, salt] = storedPassword.split('.')
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer

        return buf.toString('hex') === hashedPassword
    }
}