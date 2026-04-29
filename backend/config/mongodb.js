import mongoose from 'mongoose'

const connectDB = async() => {
    mongoose.connection.on('connected', ()=>{
        console.log(`Connected to MongoDB (${process.env.NODE_ENV || 'development'})`)
    })

    const dbUri = process.env.NODE_ENV === 'production' 
        ? process.env.MONGODB_URI_PROD 
        : process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;

    await mongoose.connect(`${dbUri}/e-commerce`)
}

export default connectDB;