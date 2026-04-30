import mongoose from 'mongoose';
import productModel from './models/productModel.js';

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/e-commerce');
        const count = await productModel.countDocuments({});
        const products = await productModel.find({});
        console.log('Product count:', count);
        console.log('First Product Name:', products[0]?.name);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
