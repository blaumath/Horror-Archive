#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'Data');
const files = fs.readdirSync(dataDir).filter((file) => file.endsWith('.js'));

let hasError = false;
const globalIdMap = new Map();
let warnings = 0;
let totalEntries = 0;

console.log('🔍 Horror Archive - Catalog Validation\n');
console.log('═══════════════════════════════════════\n');

for (const file of files) {
    const catalog = require(path.join(dataDir, file));
    const catalogName = file.replace('.js', '');

    if (!Array.isArray(catalog)) {
        console.error(`❌ ${file}: expected an array export`);
        hasError = true;
        continue;
    }

    console.log(`📁 ${catalogName} (${catalog.length} entries)`);

    if (catalog.length === 0) {
        console.warn(`  ⚠️  Catalog is empty!`);
        warnings++;
    }

    const seenIds = new Set();
    const years = [];
    let catalogErrors = 0;

    catalog.forEach((item, index) => {
        const context = `  ${catalogName}#${index + 1}`;

        // Validações de campos obrigatórios
        if (!item.title || typeof item.title !== 'string') {
            console.error(`❌ ${context} missing/invalid title`);
            hasError = true;
            catalogErrors++;
        } else if (item.title.length > 200) {
            console.warn(`⚠️  ${context} title too long: "${item.title.substring(0, 50)}..."`);
            warnings++;
        }

        if (!/^tt\d+$/.test(item.imdbId || '')) {
            console.error(`❌ ${context} invalid imdbId: ${item.imdbId || 'MISSING'}`);
            hasError = true;
            catalogErrors++;
        }

        if (!item.year || !/^\d{4}$/.test(String(item.year))) {
            console.error(`❌ ${context} invalid year: ${item.year}`);
            hasError = true;
            catalogErrors++;
        } else {
            const yearNum = Number(item.year);
            if (yearNum < 1888) { // Primeiro filme foi em 1888
                console.warn(`⚠️  ${context} year too old: ${item.year}`);
                warnings++;
            } else if (yearNum > new Date().getFullYear() + 2) {
                console.warn(`⚠️  ${context} future year: ${item.year}`);
                warnings++;
            }
            years.push(yearNum);
        }

        if (item.type && !['movie', 'series'].includes(item.type)) {
            console.error(`❌ ${context} invalid type: ${item.type} (expected movie|series)`);
            hasError = true;
            catalogErrors++;
        }

        // Verifica duplicados dentro do mesmo catálogo
        if (item.imdbId && seenIds.has(item.imdbId)) {
            console.error(`❌ ${context} duplicate imdbId in same catalog: ${item.imdbId}`);
            hasError = true;
            catalogErrors++;
        }

        if (item.imdbId) {
            seenIds.add(item.imdbId);

            // Rastreia duplicados entre catálogos
            if (!globalIdMap.has(item.imdbId)) {
                globalIdMap.set(item.imdbId, []);
            }
            globalIdMap.get(item.imdbId).push({ file: catalogName, title: item.title });
        }
    });

    // Verifica ordem cronológica para timelines
    if (/timeline/i.test(catalogName)) {
        const hasOutOfOrderYears = years.some((year, index) => index > 0 && year < years[index - 1]);
        if (hasOutOfOrderYears) {
            warnings++;
            console.log(`  ⚠️  Timeline years are not in ascending order (review ordering intent).`);
        }
    }

    if (catalogErrors === 0) {
        console.log(`  ✅ Valid`);
    }
    
    totalEntries += catalog.length;
    console.log('');
}

// Verifica duplicados entre catálogos
const crossCatalogDuplicates = [...globalIdMap.entries()]
    .filter(([, refs]) => new Set(refs.map((ref) => ref.file)).size > 1);

if (crossCatalogDuplicates.length > 0) {
    warnings++;
    console.log(`⚠️  Found ${crossCatalogDuplicates.length} IMDb IDs repeated across different catalogs:`);
    crossCatalogDuplicates.slice(0, 10).forEach(([id, refs]) => {
        console.log(`   ${id}: ${refs.map(r => r.file).join(', ')}`);
    });
    if (crossCatalogDuplicates.length > 10) {
        console.log(`   ... and ${crossCatalogDuplicates.length - 10} more`);
    }
    console.log('');
}

// Resumo final
console.log('═══════════════════════════════════════');
console.log(`📊 Total catalogs: ${files.length}`);
console.log(`📊 Total entries: ${totalEntries}`);
console.log(`📊 Unique IMDb IDs: ${globalIdMap.size}`);
console.log(`❌ Errors: ${hasError ? 'FAILED' : '0'}`);
console.log(`⚠️  Warnings: ${warnings}`);

if (hasError) {
    console.log('\n🔴 Validation FAILED! Please fix errors above.');
    process.exit(1);
} else if (warnings > 0) {
    console.log('\n🟡 Validation passed with warnings. Review warnings above.');
    process.exit(0);
} else {
    console.log('\n🟢 All catalogs are perfect! No errors or warnings.');
    process.exit(0);
}