import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import newsletterRouter from './routes/newsletterRoute.js'
import recommendationRouter from './routes/recommendationRoute.js'

//App config
const app = express()
const port = process.env.PORT || 4000
connectDB();
connectCloudinary();

// middlewares
// Restrict CORS to the origins listed in ALLOWED_ORIGINS (comma-separated).
// If the var is unset, fall back to open CORS for local development.
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : null;
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// api endpoints
app.use('/api/newsletter', newsletterRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/recommendations', recommendationRouter);
app.get('/', (req, res) => {
    res.send("API working")
})

app.listen(port, ()=> console.log('Server started on port: ' + port));