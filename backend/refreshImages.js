/**
 * refreshImages.js — re-assign category-matched, colour-varied images to every
 * product already in a database.
 *
 * Each product gets a unique Cloudinary colour variant (keyed by its _id), so a
 * large catalog looks varied instead of repeating the same handful of photos.
 * No new uploads — Cloudinary transforms are applied at delivery time.
 *
 * Usage:
 *   node refreshImages.js          # dev DB (localhost)
 *   node refreshImages.js prod     # production DB (needs a real MONGODB_URI_PROD)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from './models/productModel.js';
import { pickImages, audienceOf } from './lib/catalogImages.js';

dotenv.config();

const target = (process.argv[2] || 'dev').toLowerCase();

const resolveUri = () => {
    if (target === 'prod' || target === 'production') {
        const uri = process.env.MONGODB_URI_PROD;
        if (!uri || uri.includes('cluster.mongodb.net')) {
            console.error('\n✗ MONGODB_URI_PROD is missing or still a placeholder.\n');
            process.exit(1);
        }
        return `${uri.replace(/\/$/, '')}/e-commerce`;
    }
    const base = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017';
    return `${base.replace(/\/$/, '')}/e-commerce`;
};

const run = async () => {
    await mongoose.connect(resolveUri(), { serverSelectionTimeoutMS: 15000 });
    console.log(`\n✓ Connected to ${target.toUpperCase()} database`);

    const products = await productModel.find({}, '_id name category subCategory');
    console.log(`  Refreshing images for ${products.length} products...`);

    const ops = products.map((p) => ({
        updateOne: {
            filter: { _id: p._id },
            update: {
                $set: {
                    images: pickImages(
                        audienceOf(p.category, p.name),
                        p.subCategory,
                        String(p._id)
                    ),
                },
            },
        },
    }));

    const BATCH = 200;
    for (let i = 0; i < ops.length; i += BATCH) {
        await productModel.bulkWrite(ops.slice(i, i + BATCH));
        console.log(`  Updated ${Math.min(i + BATCH, ops.length)}/${ops.length}`);
    }

    console.log('\n✓ Done — every product now has a unique colour-varied image set.');
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('Image refresh failed:', err);
    process.exit(1);
});
