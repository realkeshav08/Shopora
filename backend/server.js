import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
const envResult = dotenv.config();
console.log("Dotenv load result:", envResult.parsed ? "Success" : "Failed");
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
console.log("Cloudinary Key from Process:", process.env.CLOUDINARY_API_KEY);
connectCloudinary();

// middlewares
app.use(cors())
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