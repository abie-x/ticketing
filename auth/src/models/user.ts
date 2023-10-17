import mongoose from "mongoose";
import { Password } from "../services/password";

//An interface that describes the properties
//that are required to create a User
interface UserAttrs {
    email: string;
    password: string
}

//an interface that describes the properties 
//that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

//an interface that describes the properties
//that a user docuemnt has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id   
            delete ret._id
            delete ret.password
            delete ret.__v
        }
    }
})  //toJSON property is used to remove the unwanted or personal data fields in sending back the user document back to the client. 'doc' property is the user document that has created and 'ret' field is the datas that should be returned.

userSchema.pre('save', async function(done) {
    if(this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'))
        this.set('password', hashed)    //setting the text password to hashed password
    }

    done()
})

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export {User}