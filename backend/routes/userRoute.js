import express from 'express'
import { loginUser, registerUser, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, listUsers } from '../controllers/userController.js'
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/profile', authUser, getProfile)
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/change-password', authUser, changePassword)
userRouter.get('/list', adminAuth, listUsers)

export default userRouter;