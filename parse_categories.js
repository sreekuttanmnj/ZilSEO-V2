import fs from 'fs';
const data = JSON.parse(fs.readFileSync('categories_detailed.json', 'utf8').replace(/^\uFEFF/, ''));

const items = data.items || data;
console.log('--- Categories and Subcategories ---');
items.forEach(cat => {
    console.log(`[CAT] ${cat.id}: ${cat.title}`);
    if (cat.subCategories && cat.subCategories.length > 0) {
        cat.subCategories.forEach(sub => {
            console.log(`  [SUB] ${sub.id}: ${sub.title}`);
        });
    }
});
