#!/usr/bin/env node
'use strict';

const http = require('http');
const app = require('../src/addon');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

const log = {
    info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
    success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
    error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
    warn: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
};

let testsPassed = 0;
let testsFailed = 0;

const server = app.listen(0, async () => {
    const { port } = server.address();
    const BASE = `http://127.0.0.1:${port}`;

    const request = (path) => new Promise((resolve, reject) => {
        const url = `${BASE}${path}`;
        http.get(url, { timeout: 5000 }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve({ 
                        status: res.statusCode, 
                        headers: res.headers,
                        body: JSON.parse(body) 
                    });
                } catch {
                    resolve({ status: res.statusCode, headers: res.headers, body });
                }
            });
        }).on('error', reject)
          .on('timeout', () => reject(new Error('Request timeout')));
    });

    const test = async (name, fn) => {
        try {
            await fn();
            testsPassed++;
            log.success(name);
        } catch (error) {
            testsFailed++;
            log.error(`${name}: ${error.message}`);
        }
    };

    console.log(`\n${COLORS.blue}🎬 Horror Archive - Smoke Tests${COLORS.reset}\n`);

    // Test 1: Manifest
    await test('Manifest returns 200 with correct structure', async () => {
        const { status, body } = await request('/manifest.json');
        if (status !== 200) throw new Error(`Status ${status}`);
        if (!body.resources?.includes('meta')) throw new Error('Missing meta resource');
        if (!body.resources?.includes('catalog')) throw new Error('Missing catalog resource');
        if (!Array.isArray(body.catalogs)) throw new Error('Missing catalogs array');
        if (body.catalogs.length === 0) throw new Error('No catalogs in manifest');
        if (!body.idPrefixes?.includes('tt')) throw new Error('Missing tt idPrefix');
    });

    // Test 2: Filtered manifest
    await test('Filtered manifest returns only selected catalogs', async () => {
        const { status, body } = await request('/scream,alien_predator_timeline/manifest.json');
        if (status !== 200) throw new Error(`Status ${status}`);
        if (body.catalogs.length !== 2) throw new Error(`Expected 2 catalogs, got ${body.catalogs.length}`);
    });

    // Test 3: Catalog endpoint
    await test('Catalog endpoint returns metas', async () => {
        const { status, body } = await request('/catalog/movie/scream.json');
        if (status !== 200) throw new Error(`Status ${status}`);
        if (!Array.isArray(body.metas)) throw new Error('Metas not an array');
        if (body.metas.length === 0) throw new Error('No metas returned');
        if (!body.metas[0].id?.startsWith('tt')) throw new Error('Invalid meta id format');
    });

    // Test 4: Catalog with skip
    await test('Catalog pagination works', async () => {
        const { body: allMetas } = await request('/catalog/movie/scream.json');
        const { body: skippedMetas } = await request('/catalog/movie/scream.json?skip=2');
        if (skippedMetas.metas.length >= allMetas.metas.length) {
            throw new Error('Skip not working correctly');
        }
    });

    // Test 5: Wrong type returns empty
    await test('Wrong catalog type returns empty', async () => {
        const { body } = await request('/catalog/series/scream.json');
        if (!Array.isArray(body.metas) || body.metas.length !== 0) {
            throw new Error('Should return empty metas for wrong type');
        }
    });

    // Test 6: Filtered config blocks non-selected catalog
    await test('Filtered config blocks non-selected catalog', async () => {
        const { body } = await request('/scream/catalog/movie/halloween.json');
        if (!Array.isArray(body.metas) || body.metas.length !== 0) {
            throw new Error('Should block non-selected catalog');
        }
    });

    // Test 7: Meta endpoint
    await test('Meta endpoint returns correct data', async () => {
        const { body: catalog } = await request('/catalog/movie/scream.json');
        const firstMeta = catalog.metas[0];
        const { status, body } = await request(`/meta/${firstMeta.type}/${firstMeta.id}.json`);
        if (status !== 200) throw new Error(`Status ${status}`);
        if (!body.meta) throw new Error('Missing meta object');
        if (body.meta.id !== firstMeta.id) throw new Error('Meta ID mismatch');
    });

    // Test 8: Prefixed meta endpoint
    await test('Prefixed meta endpoint works', async () => {
        const { body: catalog } = await request('/catalog/movie/scream.json');
        const firstMeta = catalog.metas[0];
        const { status } = await request(`/scream/meta/${firstMeta.type}/${firstMeta.id}.json`);
        if (status !== 200) throw new Error(`Status ${status}`);
    });

    // Test 9: Non-existent meta returns 404
    await test('Non-existent meta returns 404', async () => {
        const { status } = await request('/meta/movie/tt99999999.json');
        if (status !== 404) throw new Error(`Expected 404, got ${status}`);
    });

    // Test 10: Blocked meta in filtered config returns 404
    await test('Blocked meta in filtered config returns 404', async () => {
        const { status } = await request('/halloween/meta/movie/tt0117571.json');
        if (status !== 404) throw new Error(`Expected 404, got ${status}`);
    });

    // Test 11: Catalog stats endpoint
    await test('Catalog stats returns valid data', async () => {
        const { status, body } = await request('/catalog-stats.json');
        if (status !== 200) throw new Error(`Status ${status}`);
        if (!body.catalogStats) throw new Error('Missing catalogStats');
        if (typeof body.totalEntries !== 'number') throw new Error('Invalid totalEntries');
        if (body.totalEntries === 0) throw new Error('totalEntries is 0');
    });

    // Test 12: Health check
    await test('Health check returns OK', async () => {
        const { status, body } = await request('/health');
        if (status !== 200) throw new Error(`Status ${status}`);
        if (body.status !== 'OK') throw new Error('Status not OK');
    });

    // Test 13: Configure page
    await test('Configure page returns HTML', async () => {
        const { status, headers } = await request('/configure');
        if (status !== 200) throw new Error(`Status ${status}`);
        if (!headers['content-type']?.includes('text/html')) {
            throw new Error('Not HTML content type');
        }
    });

    // Test 14: CORS headers
    await test('CORS headers are present', async () => {
        const { headers } = await request('/manifest.json');
        if (!headers['access-control-allow-origin']) {
            throw new Error('Missing CORS header');
        }
    });

    // Test 15: Cache headers for manifest
    await test('Manifest has no-cache headers', async () => {
        const { headers } = await request('/manifest.json');
        const cacheControl = headers['cache-control'] || '';
        if (!cacheControl.includes('no-cache')) {
            throw new Error('Missing no-cache header on manifest');
        }
    });

    // Summary
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`${COLORS.green}✓ Passed: ${testsPassed}${COLORS.reset}`);
    if (testsFailed > 0) {
        console.log(`${COLORS.red}✗ Failed: ${testsFailed}${COLORS.reset}`);
    }
    console.log(`${'═'.repeat(50)}\n`);

    server.close();
    process.exitCode = testsFailed > 0 ? 1 : 0;
});