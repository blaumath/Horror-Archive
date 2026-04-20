const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'Data');
const files = fs.readdirSync(dataDir).filter((file) => file.endsWith('.js'));

let hasError = false;

for (const file of files) {
    const catalog = require(path.join(dataDir, file));

    if (!Array.isArray(catalog)) {
        console.error(`❌ ${file}: expected an array export`);
        hasError = true;
        continue;
    }

    const seenIds = new Set();

    catalog.forEach((item, index) => {
        const context = `${file}#${index + 1}`;

        if (!item.title || typeof item.title !== 'string') {
            console.error(`❌ ${context} missing/invalid title`);
            hasError = true;
        }

        if (!/^tt\d+$/.test(item.imdbId || '')) {
            console.error(`❌ ${context} invalid imdbId: ${item.imdbId}`);
            hasError = true;
        }

        if (!item.year || Number.isNaN(Number(item.year))) {
            console.error(`❌ ${context} invalid year: ${item.year}`);
            hasError = true;
        }

        if (seenIds.has(item.imdbId)) {
            console.error(`❌ ${context} duplicate imdbId in same catalog: ${item.imdbId}`);
            hasError = true;
        }

        seenIds.add(item.imdbId);
    });
}

if (hasError) {
    process.exit(1);
}

console.log(`✅ Catalog validation passed for ${files.length} files.`);
