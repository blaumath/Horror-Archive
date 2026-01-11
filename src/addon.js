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

// --- MAPEAMENTO PARA O FILTRO (GENRE) ---
// O nome aqui deve ser EXATAMENTE igual ao que aparecerá no menu da direita
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
    version: "2.1.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: [
        {
            type: "movie",
            id: "horror_movies_catalog",
            name: "Horror Archive", // APARECE NA ESQUERDA (Igual Marvel/DC)
            extra: [
                {
                    name: "genre",
                    options: Object.keys(genreMapper), // APARECE NA DIREITA (As Sagas)
                    isRequired: true
                }
            ]
        },
        {
            type: "series",
            id: "horror_series_catalog",
            name: "Horror Archive",
            extra: [
                {
                    name: "genre",
                    options: ["Horror TV Series"],
                    isRequired: true
                }
            ]
        }
    ],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    res.json(baseManifest);
});

// Rota do Catálogo com suporte a filtros (extra)
app.get(['/catalog/:type/:id/:extra.json', '/catalog/:type/:id.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    
    const { type, id, extra } = req.params;
    let data = [];

    // Se houver um filtro selecionado (ex: genre=Chucky Saga)
    if (extra) {
        const params = new URLSearchParams(extra.replace('.json', ''));
        const selectedGenre = params.get('genre');

        if (type === "series" && selectedGenre === "Horror TV Series") {
            data = horrorSeries;
        } else {
            data = genreMapper[selectedGenre] || [];
        }
    } else {
        // Fallback: Se nada for selecionado, mostra Chucky por padrão ou lista vazia
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