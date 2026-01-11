const express = require('express');
const cors = require('cors');
const path = require('path');

// --- IMPORTAÇÃO DE DADOS ---
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

const app = express();
app.use(cors());

// --- MAPEAMENTO COM SHORT-CODES ---
const catalogMapper = {
    "ck": chuckyRelease,
    "cj-r": conjuringRelease,
    "cj-t": conjuringTimeline,
    "f13": fridayRelease,
    "hw": halloweenRelease,
    "tv": horrorSeries,
    "ms": modernSagas,
    "nm": nightmareRelease,
    "sw": sawTimeline,
    "sc": screamData,
    "sk": stephenKingCollection
};

const catalogNames = {
    "ck": "Chucky Saga",
    "cj-r": "Conjuring (Release)",
    "cj-t": "Conjuring (Timeline)",
    "f13": "Friday the 13th",
    "hw": "Halloween: All",
    "tv": "Horror TV Series",
    "ms": "Modern Sagas",
    "nm": "Nightmare on Elm St",
    "sw": "Saw: Chronological",
    "sc": "Scream Saga",
    "sk": "Stephen King Collection"
};

const baseManifest = {
    id: "com.blaumath.horror.final", // <--- MUDANÇA CRUCIAL: ID NOVO!
    name: "Horror Legends",
    description: "The definitive archive of horror sagas.",
    version: "1.2.0", // <--- Versão nova também
    // Se este link abre no seu navegador, ele VAI abrir no Stremio agora.
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- ROTAS ---

// Rota do Manifest
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    let manifest = { ...baseManifest };
    const config = req.params.configuration;
    const codesToShow = config ? config.split(',') : Object.keys(catalogMapper);

    manifest.catalogs = codesToShow
        .filter(code => catalogMapper[code])
        .map(code => ({
            type: code === "tv" ? "series" : "movie",
            id: code,
            name: catalogNames[code]
        }));

    res.json(manifest);
});

// Rota do Catálogo (Resolve o 404)
app.get(['/catalog/:type/:id.json', '/:configuration/catalog/:type/:id.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    const catalogId = req.params.id.replace('.json', '');
    const data = catalogMapper[catalogId];

    if (!data) return res.status(404).json({ metas: [] });

    const metas = data.map(item => ({
        id: item.imdbId,
        type: item.type || "movie",
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));

    res.json({ metas });
});

app.get('/configure', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html'));
});

app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;