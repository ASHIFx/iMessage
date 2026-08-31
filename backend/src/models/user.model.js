import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique: true
    },
    hashedPassword:{
        type:String,
        required: true,
    },
    fullname:{
        type:String,
        required: true,
    },
    profilePic:{
        type:String,
        default: "",
    },
    isVerified:{
        type:Boolean,
        default: false,
        
    },
    
}, {timestamps:true})

const User = mongoose.model("User", userSchema);

export default User