const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'Data');
const files = fs.readdirSync(dataDir).filter((file) => file.endsWith('.js'));

let hasError = false;
const globalIdMap = new Map();
let warnings = 0;

for (const file of files) {
    const catalog = require(path.join(dataDir, file));

    if (!Array.isArray(catalog)) {
        console.error(`❌ ${file}: expected an array export`);
        hasError = true;
        continue;
    }

    const seenIds = new Set();
    const years = [];

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

        if (!item.year || !/^\d{4}$/.test(String(item.year))) {
            console.error(`❌ ${context} invalid year: ${item.year}`);
            hasError = true;
        }
        years.push(Number(item.year));

        if (item.type && !['movie', 'series'].includes(item.type)) {
            console.error(`❌ ${context} invalid type: ${item.type} (expected movie|series)`);
            hasError = true;
        }

        if (seenIds.has(item.imdbId)) {
            console.error(`❌ ${context} duplicate imdbId in same catalog: ${item.imdbId}`);
            hasError = true;
        }

        seenIds.add(item.imdbId);

        if (!globalIdMap.has(item.imdbId)) {
            globalIdMap.set(item.imdbId, []);
        }
        globalIdMap.get(item.imdbId).push({ file, title: item.title });
    });

    if (/timeline/i.test(file)) {
        const hasOutOfOrderYears = years.some((year, index) => index > 0 && year < years[index - 1]);
        if (hasOutOfOrderYears) {
            warnings += 1;
            console.log(`⚠️ ${file}: timeline years are not in ascending order (review ordering intent).`);
        }
    }
}

if (hasError) {
    process.exit(1);
}

const crossCatalogDuplicates = [...globalIdMap.entries()]
    .filter(([, refs]) => new Set(refs.map((ref) => ref.file)).size > 1);

if (crossCatalogDuplicates.length) {
    warnings += 1;
    console.log(`⚠️ Found ${crossCatalogDuplicates.length} IMDb IDs repeated across different catalogs (allowed, review for curation).`);
}

if (warnings > 0) {
    console.log(`ℹ️ Validation finished with ${warnings} warning(s).`);
}

console.log(`✅ Catalog validation passed for ${files.length} files.`);
