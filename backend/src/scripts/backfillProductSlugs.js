require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Product = require('../models/Product');

const toBaseSlug = (value = '') => {
  const normalized = String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'san-pham';
};

const GENERATED_SUFFIX_PATTERN = /^[a-z0-9]{6,}$/;

const pickSuffix = (slug, id) => {
  const parts = String(slug || '')
    .split('-')
    .filter(Boolean);

  if (parts.length > 1) {
    const maybeSuffix = parts.at(-1);
    const looksLikeGeneratedSuffix =
      GENERATED_SUFFIX_PATTERN.test(maybeSuffix) && /\d/.test(maybeSuffix);

    if (looksLikeGeneratedSuffix) {
      return maybeSuffix;
    }
  }

  return String(id).slice(-6);
};

const buildSlug = (product, suffixOverride) => {
  const base = toBaseSlug(product.name);
  const suffix = suffixOverride ?? pickSuffix(product.slug, product._id);
  return `${base}-${suffix}`;
};

const run = async () => {
  await connectDB();

  const products = await Product.find({}, { _id: 1, name: 1, slug: 1 }).lean();
  const usedSlugs = new Set(products.map((product) => product.slug).filter(Boolean));

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const currentSlug = String(product.slug || '');
    let nextSlug = buildSlug(product);

    if (nextSlug === currentSlug) {
      skipped += 1;
      continue;
    }

    let dedupeCounter = 1;
    while (usedSlugs.has(nextSlug) && nextSlug !== currentSlug) {
      nextSlug = buildSlug(product, `${String(product._id).slice(-6)}-${dedupeCounter}`);
      dedupeCounter += 1;
    }

    await Product.updateOne({ _id: product._id }, { $set: { slug: nextSlug } });

    usedSlugs.delete(currentSlug);
    usedSlugs.add(nextSlug);

    updated += 1;
    console.log(`[updated] ${product._id}: ${currentSlug || '<empty>'} -> ${nextSlug}`);
  }

  console.log(`[done] scanned=${products.length} updated=${updated} skipped=${skipped}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('[error] backfill failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
