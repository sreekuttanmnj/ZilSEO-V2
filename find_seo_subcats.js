import fs from 'fs';
const data = JSON.parse(fs.readFileSync('categories_detailed.json', 'utf8').replace(/^\uFEFF/, ''));
const items = data.items || data;
const seos = items.filter(c => c.title.toLowerCase().includes('seo') || c.title.toLowerCase().includes('traffic'));
console.log(JSON.stringify(seos, null, 2));
