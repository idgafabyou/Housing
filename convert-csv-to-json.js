// Node CSV -> JSON converter using PapaParse
// Usage:
//   npm install papaparse
//   node convert-csv-to-json.js properties.csv > properties.json
//
// If no input file given, defaults to 'properties.csv'

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const infile = process.argv[2] || 'properties.csv';
if (!fs.existsSync(infile)) {
  console.error('Input CSV not found:', infile);
  process.exit(2);
}

const csv = fs.readFileSync(infile, 'utf8');
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

function toBool(v) {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  return s;
}

function toNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(/,/g,''));
  return Number.isFinite(n) ? n : null;
}

const data = parsed.data.map(row => {
  // images may be semicolon-separated
  const rawImages = row.images || '';
  const imgs = String(rawImages).split(';').map(s => s.trim()).filter(Boolean);
  return {
    id: row.id || '',
    title: row.title || '',
    slug: row.slug || '',
    address: row.address || '',
    city: row.city || '',
    neighborhood: row.neighborhood || '',
    price: toNumber(row.price),
    price_currency: row.price_currency || '',
    beds: toNumber(row.beds),
    baths: toNumber(row.baths),
    furnished: row.furnished || '',
    area_sqm: toNumber(row.area_sqm),
    type: row.type || '',
    availability: row.availability || '',
    featured: toBool(row.featured) === true,
    description: row.description || '',
    images: imgs,
    contact_phone: row.contact_phone || '',
    listing_url: row.listing_url || '',
    lat: toNumber(row.lat),
    lng: toNumber(row.lng)
  };
});

// Write to stdout
process.stdout.write(JSON.stringify(data, null, 2));
