import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import productModel from './models/productModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const productsToSeed = [
    { name: "Women Round Neck Cotton Top", description: "Classic comfortable cotton top.", price: 130, imageFiles: ["p_img5.png"], category: "Women", subCategory: "Topwear", sizes: ["M", "L", "XL"], bestseller: true },
    { name: "Girls Round Neck Cotton Top", description: "Cute cotton top for girls.", price: 140, imageFiles: ["p_img6.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "L", "XL"], bestseller: true },
    { name: "Men Round Neck Pure Cotton T-shirt", description: "Premium cotton tee for men.", price: 140, imageFiles: ["p_img8.png"], category: "Men", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Girls Round Neck Cotton Top", description: "Soft cotton top.", price: 100, imageFiles: ["p_img9.png"], category: "Kids", subCategory: "Topwear", sizes: ["M", "L", "XL"], bestseller: false },
    { name: "Men Tapered Fit Flat-Front Trousers", description: "Stylish tapered trousers.", price: 110, imageFiles: ["p_img10.png"], category: "Men", subCategory: "Bottomwear", sizes: ["S", "L", "XL"], bestseller: false },
    { name: "Men Round Neck Pure Cotton T-shirt", description: "Everyday essential tee.", price: 120, imageFiles: ["p_img11.png"], category: "Men", subCategory: "Topwear", sizes: ["S", "M", "L"], bestseller: false },
    { name: "Men Round Neck Pure Cotton T-shirt", description: "Breathable cotton fabric.", price: 150, imageFiles: ["p_img12.png"], category: "Men", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Women Round Neck Cotton Top", description: "Elegant daily wear top.", price: 130, imageFiles: ["p_img13.png"], category: "Women", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Boy Round Neck Pure Cotton T-shirt", description: "Durable tee for active boys.", price: 160, imageFiles: ["p_img14.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Men Tapered Fit Flat-Front Trousers", description: "Sharp look trousers.", price: 140, imageFiles: ["p_img15.png"], category: "Men", subCategory: "Bottomwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Girls Round Neck Cotton Top", description: "Vibrant color top.", price: 170, imageFiles: ["p_img16.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Men Tapered Fit Flat-Front Trousers", description: "Comfortable formal trousers.", price: 150, imageFiles: ["p_img17.png"], category: "Men", subCategory: "Bottomwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Boy Round Neck Pure Cotton T-shirt", description: "Graphic printed tee.", price: 180, imageFiles: ["p_img18.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Boy Round Neck Pure Cotton T-shirt", description: "Classic striped tee.", price: 160, imageFiles: ["p_img19.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Women Palazzo Pants", description: "Flowy and comfortable palazzos.", price: 200, imageFiles: ["p_img22.png"], category: "Women", subCategory: "Bottomwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Boy Round Neck Pure Cotton T-shirt", description: "Cool cotton t-shirt.", price: 180, imageFiles: ["p_img23.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Boy Round Neck Pure Cotton T-shirt", description: "Essential summer wear.", price: 210, imageFiles: ["p_img24.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Girls Round Neck Cotton Top", description: "Pretty floral top.", price: 190, imageFiles: ["p_img25.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Women Zip-Front Relaxed Fit Jacket", description: "Warm and stylish jacket.", price: 220, imageFiles: ["p_img26.png"], category: "Women", subCategory: "Winterwear", sizes: ["S", "M", "L", "XL"], bestseller: false },
    { name: "Girls Round Neck Cotton Top", description: "Stylish top for any occasion.", price: 200, imageFiles: ["p_img27.png"], category: "Kids", subCategory: "Topwear", sizes: ["S", "M", "L", "XL"], bestseller: false }
];

const seedProducts = async () => {
    try {
        const baseUri = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017';
        const dbUri = `${baseUri.replace(/\/$/, '')}/e-commerce`; 
        await mongoose.connect(dbUri);
        console.log(`Connected to MongoDB (${dbUri}) for product seeding`);

        const assetsPath = path.join(__dirname, '../frontend/src/assets');

        for (const item of productsToSeed) {
            console.log(`Processing product: ${item.name}...`);
            
            const imageUrls = [];
            for (const fileName of item.imageFiles) {
                const filePath = path.join(assetsPath, fileName);
                if (fs.existsSync(filePath)) {
                    console.log(`Uploading ${fileName} to Cloudinary...`);
                    const result = await cloudinary.uploader.upload(filePath, { resource_type: 'image' });
                    imageUrls.push(result.secure_url);
                } else {
                    console.warn(`File not found: ${filePath}`);
                }
            }

            const productData = {
                name: item.name,
                description: item.description,
                price: item.price,
                images: imageUrls,
                category: item.category,
                subCategory: item.subCategory,
                sizes: item.sizes,
                bestseller: item.bestseller,
                available: true,
                date: Date.now()
            };

            const product = new productModel(productData);
            await product.save();
            console.log(`Successfully added: ${item.name}`);
        }

        console.log('\n20 more products seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
