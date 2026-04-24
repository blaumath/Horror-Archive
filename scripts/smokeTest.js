const http = require('http');
const app = require('../src/addon');

const server = app.listen(0, async () => {
    const { port } = server.address();

    const request = (path) => new Promise((resolve, reject) => {
        http.get({ host: '127.0.0.1', port, path }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, body }));
        }).on('error', reject);
    });

    try {
        const manifestRes = await request('/manifest.json');
        if (manifestRes.status !== 200) throw new Error('manifest status != 200');
        const manifest = JSON.parse(manifestRes.body);
        if (!manifest.resources.includes('meta')) throw new Error('manifest missing meta resource');

        const filteredManifestRes = await request('/scream,alien_predator_timeline/manifest.json');
        if (filteredManifestRes.status !== 200) throw new Error('filtered manifest status != 200');
        const filteredManifest = JSON.parse(filteredManifestRes.body);
        if (filteredManifest.catalogs.length !== 2) throw new Error('filtered manifest should return 2 catalogs');

        const screamCatalogRes = await request('/catalog/movie/scream.json');
        if (screamCatalogRes.status !== 200) throw new Error('catalog status != 200');
        const screamCatalog = JSON.parse(screamCatalogRes.body);
        if (!Array.isArray(screamCatalog.metas) || screamCatalog.metas.length === 0) {
            throw new Error('catalog returned no metas');
        }

        const wrongTypeCatalogRes = await request('/catalog/series/scream.json');
        const wrongTypeCatalog = JSON.parse(wrongTypeCatalogRes.body);
        if (!Array.isArray(wrongTypeCatalog.metas) || wrongTypeCatalog.metas.length !== 0) {
            throw new Error('wrong type catalog should return empty metas');
        }

        const filteredOutCatalogRes = await request('/scream/catalog/movie/halloween.json');
        const filteredOutCatalog = JSON.parse(filteredOutCatalogRes.body);
        if (!Array.isArray(filteredOutCatalog.metas) || filteredOutCatalog.metas.length !== 0) {
            throw new Error('filtered configuration should block non-selected catalog');
        }

        const firstMeta = screamCatalog.metas[0];
        const metaRes = await request(`/meta/${firstMeta.type}/${firstMeta.id}.json`);
        if (metaRes.status !== 200) throw new Error('meta status != 200');

        const prefixedMetaRes = await request(`/scream/meta/${firstMeta.type}/${firstMeta.id}.json`);
        if (prefixedMetaRes.status !== 200) throw new Error('prefixed meta status != 200');

        const blockedMetaRes = await request('/halloween/meta/movie/tt0117571.json');
        if (blockedMetaRes.status !== 404) throw new Error('blocked meta should return 404');

        const statsRes = await request('/catalog-stats.json');
        if (statsRes.status !== 200) throw new Error('catalog-stats status != 200');
        const stats = JSON.parse(statsRes.body);
        if (!stats.catalogStats || typeof stats.totalEntries !== 'number') {
            throw new Error('catalog-stats payload invalid');
        }

        console.log('✅ Smoke test passed');
        console.log(`version=${manifest.version} catalogs=${manifest.catalogs.length} entries=${stats.totalEntries}`);
    } catch (error) {
        console.error(`❌ Smoke test failed: ${error.message}`);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
