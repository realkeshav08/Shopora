import 'dotenv/config';
import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
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
        res.json({ success: false, message: error.message });
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
        const token = createToken(user._id)
        res.json({ success: true, token });

    }
    catch (error){
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Check Master Admin from .env
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            return res.json({ success: true, token });
        }

        // 2. Check Database for Admin Users
        const user = await userModel.findOne({ email });
        if (user && user.role === 'admin') {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign(user._id.toString(), process.env.JWT_SECRET);
                return res.json({ success: true, token });
            }
        }

        res.json({ success: false, message: "Invalid email or password" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get user profile
const getProfile = async (req, res) => {
    try {
        const { userId } = req;
        const user = await userModel.findById(userId).select('-password');
        console.log("Database User Profile:", user);
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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
            console.log("Uploading image to Cloudinary...");
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            updateData.image = imageUpload.secure_url;
            console.log("Cloudinary URL:", updateData.image);
        }

        console.log("Updating User with ID:", userId);
        
        const updatedUser = await userModel.findByIdAndUpdate(userId, { name, phone, address, image: updateData.image }, { new: true });
        
        if (!updatedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Reset OTP - Shopora',
            text: `Your OTP for resetting password is: ${otp}. It is valid for 15 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent to your email" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword };