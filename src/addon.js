const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const app = express();
app.use(cors());
app.use(compression());

const catalogModules = {
    halloween: require('../Data/halloweenRelease'),
    friday_13th: require('../Data/fridayRelease'),
    nightmare: require('../Data/nightmareRelease'),
    scream: require('../Data/screamData'),
    chucky_saga: require('../Data/chuckyRelease'),
    saw: require('../Data/sawTimeline'),
    evil_dead: require('../Data/evilDeadSaga'),
    texas_chainsaw: require('../Data/texasChainsawSaga'),
    hellraiser: require('../Data/hellraiserSaga'),

    conjuring_rel: require('../Data/conjuringRelease'),
    conjuring_time: require('../Data/conjuringTimeline'),
    insidious: require('../Data/insidiousSaga'),
    paranormal: require('../Data/paranormalActivity'),

    modern_horror: require('../Data/modernSagas'),
    final_dest: require('../Data/finalDestination'),
    resident_evil: require('../Data/residentEvilSaga'),
    alien_predator_timeline: require('../Data/alienPredatorTimeline'),
    a24_horror: require('../Data/a24Horror'),

    classics: require('../Data/horrorClassics'),
    psychological: require('../Data/psychologicalHorror'),
    found_footage: require('../Data/foundFootageHorror'),
    zombies: require('../Data/zombieHorror'),
    asian_horror: require('../Data/asianHorror'),

    stephen_king: require('../Data/stephenKingCollection'),
    horror_series: require('../Data/horrorSeries')
};

const catalogsData = {
    halloween: { name: '🎃 Halloween Saga', data: catalogModules.halloween },
    friday_13th: { name: '🔪 Friday the 13th', data: catalogModules.friday_13th },
    nightmare: { name: '💀 Nightmare on Elm St', data: catalogModules.nightmare },
    scream: { name: '📞 Scream Saga', data: catalogModules.scream },
    chucky_saga: { name: '🔴 Chucky Saga', data: catalogModules.chucky_saga },
    saw: { name: '🧩 Saw Legacy', data: catalogModules.saw },
    evil_dead: { name: '📖 Evil Dead Saga', data: catalogModules.evil_dead },
    texas_chainsaw: { name: '🪚 Texas Chainsaw', data: catalogModules.texas_chainsaw },
    hellraiser: { name: '📦 Hellraiser', data: catalogModules.hellraiser },

    conjuring_rel: { name: '👻 Conjuring (Release)', data: catalogModules.conjuring_rel },
    conjuring_time: { name: '⏳ Conjuring (Timeline)', data: catalogModules.conjuring_time },
    insidious: { name: '🚪 Insidious Universe', data: catalogModules.insidious },
    paranormal: { name: '📹 Paranormal Activity', data: catalogModules.paranormal },

    modern_horror: { name: '🎬 Modern Horror Sagas', data: catalogModules.modern_horror },
    final_dest: { name: '💀 Final Destination', data: catalogModules.final_dest },
    resident_evil: { name: '🧟 Resident Evil', data: catalogModules.resident_evil },
    alien_predator_timeline: { name: '👽 Alien & Predator Timeline', data: catalogModules.alien_predator_timeline },
    a24_horror: { name: '🎨 A24 & Indie Horror', data: catalogModules.a24_horror },

    classics: { name: '👑 Horror Classics (60s-00s)', data: catalogModules.classics },
    psychological: { name: '🧠 Psychological Horror', data: catalogModules.psychological },
    found_footage: { name: '📼 Found Footage', data: catalogModules.found_footage },
    zombies: { name: '🧟‍♂️ Zombie Films', data: catalogModules.zombies },
    asian_horror: { name: '🎌 Asian Horror (J-Horror/K-Horror)', data: catalogModules.asian_horror },

    stephen_king: { name: '📚 Stephen King Collection', data: catalogModules.stephen_king },
    horror_series: { name: '📺 Horror TV Series', data: catalogModules.horror_series }
};

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
    if (!configuration || typeof configuration !== 'string') return null;

    const selected = configuration
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id && catalogsData[id]);

    return selected.length ? Array.from(new Set(selected)) : null;
};

const buildManifest = (configuration) => {
    const selectedCatalogs = parseSelectedCatalogs(configuration);
    const activeCatalogIds = selectedCatalogs || Object.keys(catalogsData);

    return {
        ...baseManifest,
        catalogs: activeCatalogIds.map((id) => ({
            type: 'Horror Archive',
            id,
            name: catalogsData[id].name,
            extra: [{ name: 'skip', isRequired: false }]
        }))
    };
};
const baseManifest = {
    id: 'com.horror.archive.v13.1',
    name: '🎬 Horror Archive',
    description: 'The Ultimate Horror Collection - 700+ Films & Series | Optimized & Complete',
    version: '13.1.0',
    logo: 'https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png',
    background: 'https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png',
    resources: ['catalog'],
    types: ['movie', 'series', 'Horror Archive'],
    idPrefixes: ['tt'],
    catalogs: Object.entries(catalogsData).map(([id, entry]) => ({
        type: 'Horror Archive',
        id,
        name: entry.name,
        extra: [{ name: 'skip', isRequired: false }]
    })),
    behaviorHints: {
        configurable: true,
        configurationRequired: false,
        adult: false,
        p2p: false
    }
};

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    const manifest = buildManifest(req.params.configuration);
    res.json(manifest);
});

app.get('/catalog/:type/:id.json', (req, res) => {
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
