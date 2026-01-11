const express = require('express');
const cors = require('cors');
const path = require('path');

// --- IMPORTAÇÃO DE DADOS (Conforme sua pasta Data) ---
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

// --- MAPEAMENTO COM SHORT-CODES (Para encurtar a URL) ---
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

const baseManifest = {
    id: "com.blaumath.horror", // ID encurtado
    name: "Horror Legends", // Nome mais limpo
    description: "The definitive archive of horror sagas and series.",
    version: "1.0.1",
    // Links absolutos corrigem a falta de foto
    logo: "https://raw.githubusercontent.com/blaumath/addon-horror/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/addon-horror/main/assets/background.png",
    resources: ["catalog"],
    types: ["movie", "series", "Horror Archive"],
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- ROTAS DINÂMICAS (Correção do 404) ---

// Rota do Manifest
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    let manifest = { ...baseManifest };
    const config = req.params.configuration;

    if (config) {
        const selectedShortCodes = config.split(',');
        // Filtra os catálogos baseado nos códigos curtos da URL
        manifest.catalogs = Object.keys(catalogMapper)
            .filter(code => selectedShortCodes.includes(code))
            .map(code => {
                // Busca o nome original para exibir no Stremio
                const names = {
                    "ck": "Chucky Saga", "cj-r": "Conjuring: Release", "cj-t": "Conjuring: Timeline",
                    "f13": "Friday the 13th", "hw": "Halloween: All", "tv": "Horror TV Series",
                    "ms": "Modern Sagas", "nm": "Nightmare on Elm St", "sw": "Saw: Chronological",
                    "sc": "Scream Saga", "sk": "Stephen King Collection"
                };
                return { type: "Horror Archive", id: code, name: names[code] };
            });
    }
    res.json(manifest);
});

// Rota do Catálogo (Resolve o 404 ao aceitar o prefixo de configuração)
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