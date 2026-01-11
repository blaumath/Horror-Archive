const express = require('express');
const cors = require('cors');
const path = require('path');

// --- IMPORTAÇÃO DE DADOS ---
// Importando conforme a estrutura de pastas do seu VS Code
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

// --- MAPEAMENTO PARA O MENU DA DIREITA (GENRE) ---
const genreMapper = {
    "Chucky Saga": chuckyRelease,
    "Conjuring (Release)": conjuringRelease,
    "Conjuring (Timeline)": conjuringTimeline,
    "Friday the 13th": fridayRelease,
    "Halloween Collection": halloweenRelease,
    "Modern Sagas": modernSagas,
    "Nightmare on Elm St": nightmareRelease,
    "Saw: Chronological": sawTimeline,
    "Scream Saga": screamData,
    "Stephen King": stephenKingCollection
};

const baseManifest = {
    id: "com.blaumath.horror.archive.final",
    name: "Horror Archive",
    description: "The definitive archive of horror sagas.",
    version: "2.5.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- ROTAS ---

// Rota do Manifest (Suporta link limpo /manifest.json)
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    
    const config = req.params.configuration;
    const allGenreNames = Object.keys(genreMapper);
    let selectedGenres = allGenreNames;

    // Se houver config na URL (link longo), filtramos. 
    // Se não houver, o link é o "bonito" e mostramos tudo por padrão.
    if (config) {
        const codeMap = {
            "ck": "Chucky Saga", "cj-r": "Conjuring (Release)", "cj-t": "Conjuring (Timeline)",
            "f13": "Friday the 13th", "hw": "Halloween Collection", "ms": "Modern Sagas",
            "nm": "Nightmare on Elm St", "sw": "Saw: Chronological", "sc": "Scream Saga", "sk": "Stephen King"
        };
        const requested = config.split(',').map(code => codeMap[code]).filter(Boolean);
        if (requested.length > 0) selectedGenres = requested;
    }

    let manifest = { ...baseManifest };
    manifest.catalogs = [
        {
            type: "movie",
            id: "horror_movies_catalog",
            name: "Horror Archive", // Nome na lateral esquerda
            extra: [{ name: "genre", options: selectedGenres, isRequired: true }] // Dropdown na direita
        }
    ];

    // Adiciona o catálogo de Séries se estiver no modo "Tudo" ou se 'tv' estiver na config
    if (!config || config.includes('tv')) {
        manifest.catalogs.push({
            type: "series",
            id: "horror_series_catalog",
            name: "Horror Archive",
            extra: [{ name: "genre", options: ["Horror TV Series"], isRequired: true }]
        });
    }

    res.json(manifest);
});

// Rota do Catálogo
app.get(['/catalog/:type/:id/:extra.json', '/catalog/:type/:id.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    const { type, extra } = req.params;
    let data = [];

    if (extra) {
        const params = new URLSearchParams(extra.replace('.json', ''));
        const selectedGenre = params.get('genre');

        if (type === "series" && selectedGenre === "Horror TV Series") {
            data = horrorSeries;
        } else {
            data = genreMapper[selectedGenre] || [];
        }
    } else {
        // Fallback: mostra a primeira saga se nenhum gênero for enviado
        data = chuckyRelease;
    }

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