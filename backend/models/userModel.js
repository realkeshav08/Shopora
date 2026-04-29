import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cartData: { type: Object, default: {} },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    image: { type: String, default: "" },
    resetOTP: { type: String, default: "" },
    resetOTPExpire: { type: Number, default: 0 }
}, {minimize: false})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;