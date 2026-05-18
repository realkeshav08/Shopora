import express from 'express'
import { loginUser, registerUser, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, listUsers } from '../controllers/userController.js'
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';
import authLimiter from '../middleware/rateLimiter.js';

const userRouter = express.Router();

userRouter.post('/register', authLimiter, registerUser)
userRouter.post('/login', authLimiter, loginUser)
userRouter.post('/admin', authLimiter, adminLogin)
userRouter.post('/profile', authUser, getProfile)
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile)
userRouter.post('/forgot-password', authLimiter, forgotPassword)
userRouter.post('/reset-password', authLimiter, resetPassword)
userRouter.post('/change-password', authUser, changePassword)
userRouter.get('/list', adminAuth, listUsers)

export default userRouter;