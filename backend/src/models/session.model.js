import mongoose from "mongoose";

const sessionSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "users",
        required:[true,"user is required"]
    },
    refreshTokenHash:{
        type:String,
        required:[true,"Refresh token hash is required"]
    },
    ip:{
        type:String,
        required:[true,"IP is required"]
    },
    userAgent:{
        type:String,
        required:[true,"User Agent is required"]
    },
    revoke:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const sessionModel = new mongoose.model("session", sessionSchema);

export default sessionModel;