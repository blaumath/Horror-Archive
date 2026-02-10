const express = require('express');
const cors = require('cors');
const path = require('path');
const NodeCache = require("node-cache");
const compression = require('compression');

// --- CACHE CONFIGURAÇÃO (1h para metadata) ---
const metaCache = new NodeCache({ stdTTL: 3600 }); // 1 hora

const app = express();
app.use(cors());
app.use(compression()); // COMPRESSÃO GZIP/BROTLI

// --- IMPORTAR TODOS OS CATÁLOGOS ---
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

// --- NOVOS CATÁLOGOS ---
const evilDeadSaga = require('../Data/evilDeadSaga');
const insidiousSaga = require('../Data/insidiousSaga');
const paranormalActivity = require('../Data/paranormalActivity');
const texasChainsawSaga = require('../Data/texasChainsawSaga');
const hellraiserSaga = require('../Data/hellraiserSaga');
const finalDestination = require('../Data/finalDestination');
const residentEvilSaga = require('../Data/residentEvilSaga');
const a24Horror = require('../Data/a24Horror');
const foundFootageHorror = require('../Data/foundFootageHorror');
const horrorClassics = require('../Data/horrorClassics');
const psychologicalHorror = require('../Data/psychologicalHorror');
const zombieHorror = require('../Data/zombieHorror');
const asianHorror = require('../Data/asianHorror');

// --- CONFIGURAÇÃO DE CATÁLOGOS ---
const catalogsData = {
    // FRANQUIAS CLÁSSICAS
    "halloween": { name: "🎃 Halloween Saga", data: halloweenRelease },
    "friday_13th": { name: "🔪 Friday the 13th", data: fridayRelease },
    "nightmare": { name: "💀 Nightmare on Elm St", data: nightmareRelease },
    "scream": { name: "📞 Scream Saga", data: screamData },
    "chucky_saga": { name: "🔴 Chucky Saga", data: chuckyRelease },
    "saw": { name: "🧩 Saw Legacy", data: sawTimeline },
    "evil_dead": { name: "📖 Evil Dead Saga", data: evilDeadSaga },
    "texas_chainsaw": { name: "🪚 Texas Chainsaw", data: texasChainsawSaga },
    "hellraiser": { name: "📦 Hellraiser", data: hellraiserSaga },
    
    // UNIVERSOS CINEMATOGRÁFICOS
    "conjuring_rel": { name: "👻 Conjuring (Release)", data: conjuringRelease },
    "conjuring_time": { name: "⏳ Conjuring (Timeline)", data: conjuringTimeline },
    "insidious": { name: "🚪 Insidious Universe", data: insidiousSaga },
    "paranormal": { name: "📹 Paranormal Activity", data: paranormalActivity },
    
    // SAGAS MODERNAS
    "modern_horror": { name: "🎬 Modern Horror Sagas", data: modernSagas },
    "final_dest": { name: "💀 Final Destination", data: finalDestination },
    "resident_evil": { name: "🧟 Resident Evil", data: residentEvilSaga },
    "a24_horror": { name: "🎨 A24 & Indie Horror", data: a24Horror },
    
    // POR GÊNERO
    "classics": { name: "👑 Horror Classics (60s-00s)", data: horrorClassics },
    "psychological": { name: "🧠 Psychological Horror", data: psychologicalHorror },
    "found_footage": { name: "📼 Found Footage", data: foundFootageHorror },
    "zombies": { name: "🧟‍♂️ Zombie Films", data: zombieHorror },
    "asian_horror": { name: "🎌 Asian Horror (J-Horror/K-Horror)", data: asianHorror },
    
    // AUTORES E SÉRIES
    "stephen_king": { name: "📚 Stephen King Collection", data: stephenKingCollection },
    "horror_series": { name: "📺 Horror TV Series", data: horrorSeries }
};

// --- MANIFEST BASE ---
const baseManifest = {
    id: "com.horror.archive.v13",
    name: "🎬 Horror Archive",
    description: "The Ultimate Horror Collection - 700+ Films & Series | Optimized & Complete",
    version: "13.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog"], 
    types: ["movie", "series", "Horror Archive"], 
    idPrefixes: ["tt"], 
    catalogs: Object.keys(catalogsData).map(key => ({
        type: "Horror Archive",
        id: key,
        name: catalogsData[key].name,
        extra: [
            { name: "skip", isRequired: false }
        ]
    })),
    behaviorHints: { 
        configurable: true, 
        configurationRequired: false,
        adult: false,
        p2p: false
    }
};

// --- ROTAS ---

// Manifest
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    res.json(baseManifest);
});

// Catálogos
app.get('/catalog/:type/:id.json', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json');
    
    const catalogEntry = catalogsData[req.params.id];
    if (!catalogEntry) return res.json({ metas: [] });

    const metas = catalogEntry.data.map(item => ({
        id: item.imdbId,
        type: item.type || "movie", 
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));
    
    res.json({ metas });
});

// Página de configuração
app.get('/configure', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'configure.html'));
});
app.get('/', (req, res) => res.redirect('/configure'));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        version: baseManifest.version,
        catalogs: Object.keys(catalogsData).length,
        cacheSize: {
            meta: metaCache.keys().length
        }
    });
});

module.exports = app;
