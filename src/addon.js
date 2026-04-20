const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const app = express();
app.use(cors());
app.use(compression());

// --- IMPORTAR CATÁLOGOS ---
const chuckyRelease = require('../Data/chuckyRelease');
const conjuringRelease = require('../Data/conjuringRelease');
const conjuringTimeline = require('../Data/conjuringTimeline');
const fridayRelease = require('../Data/fridayRelease');
const halloweenRelease = require('../Data/halloweenRelease');
const horrorSeries = require('../Data/horrorSeries');
const modernSagas = require('../Data/modernSagas');
const nightmareRelease = require('../Data/nightmareRelease');
const sawTimeline = require('../Data/sawTimeline');
const screamData = require('../Data/screamData');
const stephenKingCollection = require('../Data/stephenKingCollection');

const evilDeadSaga = require('../Data/evilDeadSaga');
const insidiousSaga = require('../Data/insidiousSaga');
const paranormalActivity = require('../Data/paranormalActivity');
const texasChainsawSaga = require('../Data/texasChainsawSaga');
const hellraiserSaga = require('../Data/hellraiserSaga');
const finalDestination = require('../Data/finalDestination');
const residentEvilSaga = require('../Data/residentEvilSaga');
const alienPredatorTimeline = require('../Data/alienPredatorTimeline');
const a24Horror = require('../Data/a24Horror');
const foundFootageHorror = require('../Data/foundFootageHorror');
const horrorClassics = require('../Data/horrorClassics');
const psychologicalHorror = require('../Data/psychologicalHorror');
const zombieHorror = require('../Data/zombieHorror');
const asianHorror = require('../Data/asianHorror');

// --- CONFIGURAÇÃO DE CATÁLOGOS ---
const catalogsData = {
    // FRANQUIAS CLÁSSICAS
    halloween: { name: '🎃 Halloween Saga', data: halloweenRelease },
    friday_13th: { name: '🔪 Friday the 13th', data: fridayRelease },
    nightmare: { name: '💀 Nightmare on Elm St', data: nightmareRelease },
    scream: { name: '📞 Scream Saga', data: screamData },
    chucky_saga: { name: '🔴 Chucky Saga', data: chuckyRelease },
    saw: { name: '🧩 Saw Legacy', data: sawTimeline },
    evil_dead: { name: '📖 Evil Dead Saga', data: evilDeadSaga },
    texas_chainsaw: { name: '🪚 Texas Chainsaw', data: texasChainsawSaga },
    hellraiser: { name: '📦 Hellraiser', data: hellraiserSaga },

    // UNIVERSOS CINEMATOGRÁFICOS
    conjuring_rel: { name: '👻 Conjuring (Release)', data: conjuringRelease },
    conjuring_time: { name: '⏳ Conjuring (Timeline)', data: conjuringTimeline },
    insidious: { name: '🚪 Insidious Universe', data: insidiousSaga },
    paranormal: { name: '📹 Paranormal Activity', data: paranormalActivity },

    // SAGAS MODERNAS
    modern_horror: { name: '🎬 Modern Horror Sagas', data: modernSagas },
    final_dest: { name: '💀 Final Destination', data: finalDestination },
    resident_evil: { name: '🧟 Resident Evil', data: residentEvilSaga },
    alien_predator_timeline: { name: '👽 Alien & Predator Timeline', data: alienPredatorTimeline },
    a24_horror: { name: '🎨 A24 & Indie Horror', data: a24Horror },

    // POR GÊNERO
    classics: { name: '👑 Horror Classics (60s-00s)', data: horrorClassics },
    psychological: { name: '🧠 Psychological Horror', data: psychologicalHorror },
    found_footage: { name: '📼 Found Footage', data: foundFootageHorror },
    zombies: { name: '🧟‍♂️ Zombie Films', data: zombieHorror },
    asian_horror: { name: '🎌 Asian Horror (J-Horror/K-Horror)', data: asianHorror },

    // AUTORES E SÉRIES
    stephen_king: { name: '📚 Stephen King Collection', data: stephenKingCollection },
    horror_series: { name: '📺 Horror TV Series', data: horrorSeries }
};

const buildCatalogEntry = (id) => ({
    type: 'Horror Archive',
    id,
    name: catalogsData[id].name,
    extra: [{ name: 'skip', isRequired: false }]
});

const buildMetas = (items) => items.map((item) => ({
    id: item.imdbId,
    type: item.type || 'movie',
    name: item.title,
    releaseInfo: String(item.year),
    poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
    posterShape: 'poster'
}));

const metasByCatalogId = Object.fromEntries(
    Object.entries(catalogsData).map(([id, entry]) => [id, buildMetas(entry.data)])
);

const parseSelectedCatalogs = (configuration = '') => {
    if (typeof configuration !== 'string') return null;
    if (!configuration) return null;

    const selected = configuration
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id && catalogsData[id]);

    return Array.from(new Set(selected));
};

const baseManifest = {
    id: 'com.horror.archive.v13.1.2',
    name: '🎬 Horror Archive',
    description: 'The Ultimate Horror Collection - 700+ Films & Series | Optimized & Complete',
    version: '13.1.2',
    logo: 'https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png',
    background: 'https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png',
    resources: ['catalog'],
    types: ['movie', 'series', 'Horror Archive'],
    idPrefixes: ['tt'],
    catalogs: Object.keys(catalogsData).map(buildCatalogEntry),
    behaviorHints: {
        configurable: true,
        configurationRequired: false,
        adult: false,
        p2p: false
    }
};

const buildManifest = (configuration) => {
    const selectedCatalogs = parseSelectedCatalogs(configuration);
    const activeCatalogIds = selectedCatalogs === null ? Object.keys(catalogsData) : selectedCatalogs;

    return {
        ...baseManifest,
        catalogs: activeCatalogIds.map(buildCatalogEntry)
    };
};

// Manifest
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    res.json(buildManifest(req.params.configuration));
});

// Catálogos (com ou sem configuração no prefixo da URL)
app.get(['/catalog/:type/:id.json', '/:configuration/catalog/:type/:id.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json');

    const metas = metasByCatalogId[req.params.id] || [];
    res.json({ metas });
});

app.get('/configure', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'configure.html'));
});

app.get('/', (req, res) => res.redirect('/configure'));

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        version: baseManifest.version,
        catalogs: Object.keys(catalogsData).length
    });
});

module.exports = app;
