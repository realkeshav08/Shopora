/**
 * catalogImages.js — image selection for the catalog seeder.
 *
 * The image pool (data/seedImagePool.json) is keyed by `audience|subCategory`
 * where audience is Men / Women / Boys / Girls — every URL has been visually
 * verified to match. Each product is given ONE category-matched image, plus a
 * unique Cloudinary colour variant (e_hue / e_saturation / e_brightness) so a
 * large catalog looks varied. Transforms are applied at delivery — no uploads,
 * no extra storage.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'seedImagePool.json'), 'utf-8')
);
// keep only real pool entries (skip metadata keys like "_comment")
const imagePool = Object.fromEntries(
    Object.entries(raw).filter(([k, v]) => !k.startsWith('_') && Array.isArray(v))
);

// Deterministic string hash (djb2) — same seed always yields the same variant.
const hashOf = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h;
};

// Insert a Cloudinary transformation into an /upload/ URL (no re-upload).
const applyTransform = (url, transform) => {
    const marker = '/upload/';
    const at = url.indexOf(marker);
    if (at === -1) return url; // not a Cloudinary URL — leave untouched
    return url.slice(0, at + marker.length) + transform + '/' + url.slice(at + marker.length);
};

/**
 * Resolve the audience (Men / Women / Boys / Girls) for a product.
 * For Kids, it's read from the product name; falls back to a stable choice.
 */
export const audienceOf = (category, name = '') => {
    if (category !== 'Kids') return category; // Men / Women
    if (/^girls/i.test(name)) return 'Girls';
    if (/^boys/i.test(name)) return 'Boys';
    return hashOf(name) % 2 === 0 ? 'Boys' : 'Girls';
};

// Category-matched image pool, with sensible fallbacks.
const poolFor = (audience, subCategory) => {
    let pool = imagePool[`${audience}|${subCategory}`];
    if (pool && pool.length) return pool;
    // fallback: same subcategory, any audience
    pool = Object.entries(imagePool)
        .filter(([k]) => k.endsWith(`|${subCategory}`))
        .flatMap(([, v]) => v);
    if (pool.length) return pool;
    // last resort: everything
    return Object.values(imagePool).flat();
};

/**
 * Pick ONE category-matched image for a product, re-coloured with a unique,
 * deterministic Cloudinary transform derived from `seedStr` (pass the product
 * _id or a unique name for maximum variety).
 */
export const pickImages = (audience, subCategory, seedStr) => {
    const pool = poolFor(audience, subCategory);
    const h = hashOf(String(seedStr));

    // Mild ranges so the result looks like a natural colourway, not a glitch.
    // Note: >>> (unsigned shift) — a plain >> would go negative on large hashes.
    const hue = (h % 101) - 50;               // -50 .. 50
    const saturation = ((h >>> 4) % 71) - 25; // -25 .. 45
    const brightness = ((h >>> 9) % 21) - 10; // -10 .. 10
    const transform = `e_hue:${hue},e_saturation:${saturation},e_brightness:${brightness}`;

    const base = pool[h % pool.length];
    return [applyTransform(base, transform)];
};
