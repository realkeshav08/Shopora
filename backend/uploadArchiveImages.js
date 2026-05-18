/**
 * uploadArchiveImages.js — one-time importer for the kids' fashion dataset.
 *
 * Reads the Myntra kids dataset in `seed-image-dataset/`, picks a curated set
 * of Boys/Girls Topwear & Bottomwear images, uploads them to Cloudinary, and
 * merges the resulting URLs into data/seedImagePool.json.
 *
 * This fills the gap where Shopora had no kids' bottomwear images and only a
 * few kids' topwear images. Run once:  node uploadArchiveImages.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVE = path.join(__dirname, '..', 'seed-image-dataset');
const CSV = path.join(ARCHIVE, 'data', 'fashion.csv');
const POOL_FILE = path.join(__dirname, 'data', 'seedImagePool.json');

const PER_GROUP = 50;        // images to upload per audience+subcategory
const TARGETS = [            // [Gender, SubCategory]
    ['Boys', 'Topwear'],
    ['Boys', 'Bottomwear'],
    ['Girls', 'Topwear'],
    ['Girls', 'Bottomwear'],
];

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Parse the dataset CSV. ProductTitle may contain commas, so we rely on the
// fixed leading columns and the fixed trailing two (Image, ImageURL).
const parseCsv = () => {
    const lines = fs.readFileSync(CSV, 'utf-8').split(/\r?\n/).filter(Boolean);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const f = lines[i].split(',');
        if (f.length < 10) continue;
        rows.push({
            gender: f[1],
            category: f[2],
            subCategory: f[3],
            image: f[f.length - 2], // filename, e.g. 42419.jpg
        });
    }
    return rows;
};

const localPath = (gender, image) =>
    path.join(ARCHIVE, 'data', 'Apparel', gender, 'Images', 'images_with_product_ids', image);

const run = async () => {
    if (!fs.existsSync(CSV)) {
        console.error(`✗ Dataset CSV not found at ${CSV}`);
        process.exit(1);
    }

    const rows = parseCsv();
    const pool = JSON.parse(fs.readFileSync(POOL_FILE, 'utf-8'));

    for (const [gender, subCategory] of TARGETS) {
        const key = `${gender}|${subCategory}`;
        const candidates = rows
            .filter((r) => r.category === 'Apparel' && r.gender === gender && r.subCategory === subCategory)
            .filter((r) => fs.existsSync(localPath(gender, r.image)))
            .slice(0, PER_GROUP);

        console.log(`\n${key}: uploading ${candidates.length} images...`);
        const urls = [];
        for (let i = 0; i < candidates.length; i++) {
            try {
                const res = await cloudinary.uploader.upload(
                    localPath(gender, candidates[i].image),
                    { folder: 'shopora/catalog', resource_type: 'image' }
                );
                urls.push(res.secure_url);
                if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${candidates.length}`);
            } catch (err) {
                console.warn(`  skipped ${candidates[i].image}: ${err.message}`);
            }
        }
        pool[key] = urls;
        console.log(`  ✓ ${key}: ${urls.length} uploaded`);
    }

    fs.writeFileSync(POOL_FILE, JSON.stringify(pool, null, 2) + '\n');
    console.log(`\n✓ Updated ${POOL_FILE}`);
    process.exit(0);
};

run().catch((err) => {
    console.error('Upload failed:', err);
    process.exit(1);
});
