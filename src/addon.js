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

// --- MAPEAMENTO DE CATÁLOGOS ---
const catalogMapper = {
    "chucky-saga": chuckyRelease,
    "conjuring-release": conjuringRelease,
    "conjuring-timeline": conjuringTimeline,
    "friday-13th": fridayRelease,
    "halloween-all": halloweenRelease,
    "horror-series": horrorSeries,
    "modern-sagas": modernSagas,
    "nightmare-elm": nightmareRelease,
    "saw-timeline": sawTimeline,
    "scream-collection": screamData,
    "stephen-king": stephenKingCollection
};

const baseManifest = {
    id: "com.blaumath.horrorarchive",
    name: "Horror Legends Collection",
    description: "The definitive archive of horror sagas and supernatural series.",
    version: "1.0.1", // Versão atualizada para forçar o Stremio a limpar o cache
    logo: "https://raw.githubusercontent.com/blaumath/addon-horror/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/addon-horror/main/assets/background.png",
    resources: ["catalog"],
    types: ["movie", "series", "Horror Archive"],
    catalogs: [
        { type: "Horror Archive", id: "conjuring-release", name: "The Conjuring: Release" },
        { type: "Horror Archive", id: "conjuring-timeline", name: "The Conjuring: Timeline" },
        { type: "Horror Archive", id: "scream-collection", name: "Scream: Full Saga" },
        { type: "Horror Archive", id: "halloween-all", name: "Halloween: Complete" },
        { type: "Horror Archive", id: "saw-timeline", name: "Saw: Chronological" },
        { type: "Horror Archive", id: "friday-13th", name: "Friday the 13th" },
        { type: "Horror Archive", id: "chucky-saga", name: "Chucky / Child's Play" },
        { type: "Horror Archive", id: "nightmare-elm", name: "A Nightmare on Elm Street" },
        { type: "Horror Archive", id: "stephen-king", name: "Stephen King Collection" },
        { type: "Horror Archive", id: "modern-sagas", name: "Modern Sagas (Terrifier/X/Purge)" },
        { type: "Horror Archive", id: "horror-series", name: "Horror TV Series" }
    ],
    idPrefixes: ["tt"],
    behaviorHints: { 
        configurable: true, 
        configurationRequired: false 
    }
};

// --- ROTAS ---

// Rota para o Manifest (Suporta a configuração via URL)
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    
    let manifest = { ...baseManifest };
    const config = req.params.configuration;

    if (config) {
        const selectedIds = config.split(',');
        manifest.catalogs = baseManifest.catalogs.filter(cat => selectedIds.includes(cat.id));
    }

    res.json(manifest);
});

// Rota de Catálogo Dinâmico
app.get('/catalog/Horror%20Archive/:id.json', (req, res) => {
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

// Rota da Página de Configuração
app.get('/configure', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html'));
});

app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;