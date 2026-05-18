import 'dotenv/config';
import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { sendMail } from '../config/mailer.js';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}
// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success:false, message: "User doesn't exists"})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success:false, message: "Invalid password" });
        }
        else{
            const token = createToken(user._id);
            res.json({ success: true, token: token });
        }
        
    }
    catch (err) {
        console.error(err);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({ success:false, message: "User already exists" });
        }
        if(!validator.isEmail(email)){
            return res.json({ success:false, message: "Please enter a valid email" });
        }
        if(password.length < 8){
            return res.json({ success:false, message: "Please enter a strong password"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });
        const user = await newUser.save();
        // Notify the admin panel that the user list changed (real-time).
        req.app.get('io')?.emit('users:updated');
        const token = createToken(user._id)
        res.json({ success: true, token });

    }
    catch (error){
        console.log(error);
        res.json({success: false, message: "Something went wrong. Please try again later."})
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Check Master Admin from .env
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.json({ success: true, token });
        }

        // 2. Check Database for Admin Users
        const user = await userModel.findOne({ email });
        if (user && user.role === 'admin') {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ id: user._id.toString(), role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
                return res.json({ success: true, token });
            }
        }

        res.json({ success: false, message: "Invalid email or password" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

// API to get user profile
const getProfile = async (req, res) => {
    try {
        const { userId } = req;
        const user = await userModel.findById(userId).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId } = req;
        const { name, phone, address } = req.body;
        const imageFile = req.file;

        let updateData = { name, phone, address };

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            updateData.image = imageUpload.secure_url;
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, { name, phone, address, image: updateData.image }, { new: true });
        
        if (!updatedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

// API to send OTP for forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOTP = otp;
        user.resetOTPExpire = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        await sendMail({
            to: email,
            subject: 'Password Reset OTP - Shopora',
            text: `Your OTP for resetting password is: ${otp}. It is valid for 15 minutes.`
        });
        res.json({ success: true, message: "OTP sent to your email" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

// API to reset password using OTP
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await userModel.findOne({ email });

        if (!user || user.resetOTP !== otp || user.resetOTPExpire < Date.now()) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetOTP = "";
        user.resetOTPExpire = 0;
        await user.save();

        res.json({ success: true, message: "Password reset successful" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

// API to change password for a logged-in user
const changePassword = async (req, res) => {
    try {
        const { userId } = req;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.json({ success: false, message: "All fields are required" });
        }
        if (newPassword.length < 8) {
            return res.json({ success: false, message: "New password must be at least 8 characters" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        const sameAsOld = await bcrypt.compare(newPassword, user.password);
        if (sameAsOld) {
            return res.json({ success: false, message: "New password must be different from the current one" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

// API to list all registered users (admin only)
const listUsers = async (req, res) => {
    try {
        const users = await userModel
            .find({})
            .select('-password -resetOTP -resetOTPExpire -cartData')
            .sort({ _id: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong. Please try again later." });
    }
}

export { loginUser, registerUser, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, listUsers };