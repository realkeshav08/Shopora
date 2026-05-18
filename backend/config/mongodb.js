import mongoose from 'mongoose'

const connectDB = async() => {
    mongoose.connection.on('connected', ()=>{
        console.log(`Connected to MongoDB (${process.env.NODE_ENV || 'development'})`)
    })

    const dbUri = process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;

    // The `dbName` option selects the database regardless of what the URI's
    // path/query looks like — robust to connection strings with ?appName=... etc.
    await mongoose.connect(dbUri, { dbName: 'e-commerce' })
}

export default connectDB;