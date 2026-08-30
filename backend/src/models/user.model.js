import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique: true
    },
    fullname:{
        type:String,
        required: true,
        unique: true
    },
    profilePic:{
        type:String,
        required: true,
        unique: true
    },
    
}, {timestamps:true})

const User = mongoose.model("User", userSchema);

export default User