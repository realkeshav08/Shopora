/**
 * seedCatalog.js — Catalog seeder for Shopora.
 *
 * Generates a large, consistent product catalog: realistic names/descriptions,
 * INR prices, varied sizes, stock status and dates.
 *
 * Images: each product gets ONE category- AND audience-matched image (verified
 * pool in data/seedImagePool.json), recoloured with a unique Cloudinary URL
 * transform — so NO new uploads happen and products still look varied.
 *
 * Note: the verified image pool covers Men/Women across all three
 * subcategories and Boys/Girls for Topwear + Bottomwear. There are no kids'
 * winterwear photos, so Kids/Winterwear is intentionally omitted.
 *
 * Usage:
 *   node seedCatalog.js                  # dev DB, fix existing + add 500
 *   node seedCatalog.js dev 500 wipe     # wipe ALL products, then seed 500 fresh
 *   node seedCatalog.js prod 500 wipe    # same, on production (real URI needed)
 *   node seedCatalog.js dev 500 force    # add a batch even if DB already populated
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from './models/productModel.js';
import { pickImages } from './lib/catalogImages.js';

dotenv.config();

// ----------------------------------------------------------------------------
// Args
// ----------------------------------------------------------------------------
const target = (process.argv[2] || 'dev').toLowerCase();
const COUNT = parseInt(process.argv[3], 10) || 500;
const flags = process.argv.slice(4).map((a) => a.toLowerCase());
const wipe = flags.includes('wipe');
const force = flags.includes('force');

const resolveUri = () => {
    if (target === 'prod' || target === 'production') {
        const uri = process.env.MONGODB_URI_PROD;
        if (!uri || uri.includes('cluster.mongodb.net')) {
            console.error('\n✗ MONGODB_URI_PROD is missing or still a placeholder.');
            console.error('  Create a real Atlas cluster, put its URI in backend/.env, then re-run.\n');
            process.exit(1);
        }
        return `${uri.replace(/\/$/, '')}/e-commerce`;
    }
    const base = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017';
    return `${base.replace(/\/$/, '')}/e-commerce`;
};

// ----------------------------------------------------------------------------
// Catalog vocabulary
// ----------------------------------------------------------------------------
// Only combinations that have a verified, matching image pool. Kids cover
// Topwear + Bottomwear (Boys/Girls dataset); there are no kids' winterwear
// photos, so Kids/Winterwear is intentionally omitted.
const COMBOS = [
    { category: 'Men', subCategory: 'Topwear', audience: 'Men' },
    { category: 'Men', subCategory: 'Bottomwear', audience: 'Men' },
    { category: 'Men', subCategory: 'Winterwear', audience: 'Men' },
    { category: 'Women', subCategory: 'Topwear', audience: 'Women' },
    { category: 'Women', subCategory: 'Bottomwear', audience: 'Women' },
    { category: 'Women', subCategory: 'Winterwear', audience: 'Women' },
    { category: 'Kids', subCategory: 'Topwear', audience: 'Boys' },
    { category: 'Kids', subCategory: 'Topwear', audience: 'Girls' },
    { category: 'Kids', subCategory: 'Bottomwear', audience: 'Boys' },
    { category: 'Kids', subCategory: 'Bottomwear', audience: 'Girls' },
];

const TYPES = {
    'Men|Topwear': ['Round Neck T-Shirt', 'Polo T-Shirt', 'Henley T-Shirt', 'Casual Shirt', 'Formal Shirt', 'Graphic Print T-Shirt', 'Oversized T-Shirt', 'V-Neck T-Shirt'],
    'Women|Topwear': ['Round Neck Top', 'Crop Top', 'Casual Shirt', 'Printed Blouse', 'Tank Top', 'Tunic Top', 'Graphic T-Shirt', 'Off-Shoulder Top'],
    'Kids|Topwear': ['Round Neck T-Shirt', 'Graphic Print T-Shirt', 'Polo T-Shirt', 'Cotton Top', 'Striped T-Shirt'],
    'Kids|Bottomwear': ['Jogger Pants', 'Denim Jeans', 'Track Pants', 'Cotton Shorts', 'Pull-On Trousers', 'Capris'],
    'Men|Bottomwear': ['Slim Fit Jeans', 'Chinos', 'Cargo Trousers', 'Joggers', 'Formal Trousers', 'Track Pants', 'Denim Shorts'],
    'Women|Bottomwear': ['Palazzo Pants', 'High-Waist Jeans', 'Leggings', 'Culottes', 'Track Pants', 'Pencil Trousers', 'Denim Shorts'],
    'Men|Winterwear': ['Zip-Front Jacket', 'Bomber Jacket', 'Puffer Jacket', 'Denim Jacket', 'Hooded Sweatshirt', 'Pullover Sweater', 'Fleece Jacket'],
    'Women|Winterwear': ['Zip-Front Jacket', 'Puffer Jacket', 'Quilted Jacket', 'Hooded Sweatshirt', 'Cardigan', 'Pullover Sweater', 'Long Coat'],
};

const FITS = ['Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Tapered Fit', 'Oversized', 'Classic Fit'];
const COLORS = ['Black', 'White', 'Navy Blue', 'Charcoal Grey', 'Olive Green', 'Maroon', 'Beige', 'Sky Blue', 'Mustard Yellow', 'Dusty Pink', 'Teal', 'Rust Orange', 'Lavender', 'Coffee Brown', 'Forest Green'];
const MATERIALS = ['pure cotton', 'a cotton blend', 'a linen blend', 'premium cotton', 'a soft knit', 'denim', 'fleece', 'a polyester blend'];

const SIZE_SETS = {
    adultTop: ['S', 'M', 'L', 'XL', 'XXL'],
    adultBottom: ['28', '30', '32', '34', '36', '38'],
    kids: ['XS', 'S', 'M', 'L'],
};

// realistic INR price bands by subcategory [min, max]
const PRICE_BANDS = {
    Topwear: [399, 1799],
    Bottomwear: [799, 2999],
    Winterwear: [1299, 4999],
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

// snap a number to a retail-style "...99" price
const snap99 = (n) => Math.max(199, Math.round(n / 100) * 100 - 1);

const priceFor = (category, subCategory, frac = Math.random()) => {
    let [lo, hi] = PRICE_BANDS[subCategory];
    if (category === 'Kids') { lo = Math.round(lo * 0.6); hi = Math.round(hi * 0.6); }
    return snap99(lo + frac * (hi - lo));
};

const sizesFor = (category, subCategory) => {
    let set;
    if (category === 'Kids') set = SIZE_SETS.kids;
    else set = subCategory === 'Bottomwear' ? SIZE_SETS.adultBottom : SIZE_SETS.adultTop;
    const len = randInt(3, set.length);
    const start = randInt(0, set.length - len);
    return set.slice(start, start + len);
};

const describe = (subCategory, type, color, fit, material) => {
    const t = type.toLowerCase();
    const c = color.toLowerCase();
    if (subCategory === 'Topwear') {
        return `A comfortable ${t} in a versatile ${c} shade, made from ${material}. ${fit} for all-day comfort — soft, breathable, and easy to pair with anything in your wardrobe.`;
    }
    if (subCategory === 'Bottomwear') {
        return `${fit} ${t} crafted from durable ${material}. A well-tailored ${c} essential that moves with you and keeps its shape wash after wash.`;
    }
    return `Stay warm in this ${c} ${t} made with cosy ${material}. A ${fit.toLowerCase()} layer that's a dependable choice for the colder months.`;
};

// generic, subcategory-correct description for fixing broken existing products
const GENERIC_DESC = {
    Topwear: 'A soft, breathable top crafted for everyday comfort. Versatile, easy to layer, and simple to style for any casual occasion.',
    Bottomwear: 'Well-tailored bottomwear made from durable fabric. Comfortable through the day with a clean, modern fit that holds its shape.',
    Winterwear: 'A cosy layer built to keep you warm. Insulating fabric with a comfortable cut — a dependable choice for the colder months.',
};

// ----------------------------------------------------------------------------
// Step 1 — fix existing products (skipped when wiping)
// ----------------------------------------------------------------------------
const BAD_DESC = 'lightweight, usually knitted, pullover shirt';

const fixExistingProducts = async () => {
    const existing = await productModel.find({});
    let descFixed = 0, priceFixed = 0;

    for (const p of existing) {
        let changed = false;

        const desc = p.description || '';
        if (!desc || desc.includes(BAD_DESC) || desc.length < 15) {
            p.description = GENERIC_DESC[p.subCategory] || GENERIC_DESC.Topwear;
            descFixed++;
            changed = true;
        }

        const frac = Math.min(Math.max((p.price || 0) / 260, 0), 1);
        const newPrice = PRICE_BANDS[p.subCategory]
            ? priceFor(p.category, p.subCategory, frac)
            : snap99((p.price || 500) * 12);
        if (p.price !== newPrice) {
            p.price = newPrice;
            priceFixed++;
            changed = true;
        }

        if (changed) await p.save();
    }

    console.log(`  Fixed descriptions: ${descFixed} | rescaled prices: ${priceFixed} (of ${existing.length} existing)`);
};

// ----------------------------------------------------------------------------
// Step 2 — generate new products
// ----------------------------------------------------------------------------
const generateProducts = (count) => {
    const products = [];
    for (let i = 0; i < count; i++) {
        // round-robin combos so every category/type filter has plenty of items
        const { category, subCategory, audience } = COMBOS[i % COMBOS.length];
        const type = rand(TYPES[`${category}|${subCategory}`]);
        const fit = rand(FITS);
        const color = rand(COLORS);
        const material = rand(MATERIALS);

        const name = `${audience} ${color} ${type}`;
        products.push({
            name,
            description: describe(subCategory, type, color, fit, material),
            price: priceFor(category, subCategory),
            images: pickImages(audience, subCategory, `${name}#${i}`),
            category,
            subCategory,
            sizes: sizesFor(category, subCategory),
            bestseller: Math.random() < 0.15,
            available: Math.random() < 0.9, // ~10% out of stock for testing
            date: Date.now() - randInt(0, 120) * 24 * 60 * 60 * 1000,
        });
    }
    return products;
};

// ----------------------------------------------------------------------------
// Run
// ----------------------------------------------------------------------------
const run = async () => {
    await mongoose.connect(resolveUri(), { serverSelectionTimeoutMS: 15000 });
    console.log(`\n✓ Connected to ${target.toUpperCase()} database`);

    const before = await productModel.countDocuments({});
    console.log(`  Products before: ${before}`);

    if (wipe) {
        await productModel.deleteMany({});
        console.log('  Wiped all existing products.');
    } else {
        if (before > 400 && !force) {
            console.error(`\n✗ Database already has ${before} products. Re-running would duplicate the catalog.`);
            console.error('  Use "wipe" to replace the catalog, or "force" to add another batch:');
            console.error(`  node seedCatalog.js ${target} ${COUNT} wipe\n`);
            await mongoose.disconnect();
            process.exit(1);
        }
        console.log('\n[1/2] Fixing existing products...');
        await fixExistingProducts();
    }

    console.log(`\n[${wipe ? '1/1' : '2/2'}] Generating ${COUNT} new products...`);
    const products = generateProducts(COUNT);
    const BATCH = 100;
    for (let i = 0; i < products.length; i += BATCH) {
        await productModel.insertMany(products.slice(i, i + BATCH));
        console.log(`  Inserted ${Math.min(i + BATCH, products.length)}/${products.length}`);
    }

    const after = await productModel.countDocuments({});
    console.log(`\n✓ Done. Products: ${before} → ${after}`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
