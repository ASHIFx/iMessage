import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required:true
    },
    email:{
        type:String,
        required:true
    },
    otpHash:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    }
},{
    timestamps:true
})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = new mongoose.model("otp",otpSchema);

export default otpModel;