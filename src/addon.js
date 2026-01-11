const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

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

// --- CONFIGURAÇÃO DAS CHAVES (Vercel) ---
// Note que usei exatamente os nomes que aparecem no seu print do Vercel
const TMDB_API_KEY = process.env.TMDB_API_Key; 
const OMDB_API_KEY = process.env.OMDB_API_KEY;

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
    "Stephen King": stephenKingCollection,
    "Horror TV Series": horrorSeries
};

const baseManifest = {
    id: "com.blaumath.horror.archive.final",
    name: "Horror Archive",
    description: "The definitive archive of horror sagas with Dual-API Posters.",
    version: "3.6.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog"],
    types: ["Horror Archive", "movie", "series"], 
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- SISTEMA INTELIGENTE DE POSTERS (TMDB -> OMDB -> METAHUB) ---
async function getBestPoster(imdbId) {
    // 1. Tenta TMDB (Melhor Qualidade)
    if (TMDB_API_KEY) {
        try {
            const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            const res = await axios.get(tmdbUrl);
            const movie = res.data.movie_results[0] || res.data.tv_results[0];
            if (movie && movie.poster_path) {
                return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            }
        } catch (e) { console.error("TMDB Error"); }
    }

    // 2. Tenta OMDb (Plano B)
    if (OMDB_API_KEY) {
        try {
            const omdbUrl = `http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
            const res = await axios.get(omdbUrl);
            if (res.data && res.data.Poster && res.data.Poster !== "N/A") {
                return res.data.Poster;
            }
        } catch (e) { console.error("OMDB Error"); }
    }

    // 3. Fallback Final (Metahub)
    return `https://images.metahub.space/poster/medium/${imdbId}/img`;
}

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    
    const config = req.params.configuration;
    const allGenreNames = Object.keys(genreMapper);
    let selectedGenres = allGenreNames;

    if (config) {
        const codeMap = {
            "ck": "Chucky Saga", "cj-r": "Conjuring (Release)", "cj-t": "Conjuring (Timeline)",
            "f13": "Friday the 13th", "hw": "Halloween Collection", "ms": "Modern Sagas",
            "nm": "Nightmare on Elm St", "sw": "Saw: Chronological", "sc": "Scream Saga", 
            "sk": "Stephen King", "tv": "Horror TV Series"
        };
        const requested = config.split(',').map(code => codeMap[code]).filter(Boolean);
        if (requested.length > 0) selectedGenres = requested;
    }

    let manifest = { ...baseManifest };
    manifest.catalogs = [{
        type: "Horror Archive", 
        id: "horror_archive_main",
        name: "Sagas",
        extra: [{ name: "genre", options: selectedGenres, isRequired: true }]
    }];

    res.json(manifest);
});

app.get(['/catalog/:type/:id/:extra.json', '/catalog/:type/:id.json'], async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    
    const { type, extra } = req.params;
    let rawData = [];

    if (type === "Horror Archive" && extra) {
        const params = new URLSearchParams(extra.replace('.json', ''));
        const selectedGenre = params.get('genre');
        rawData = genreMapper[selectedGenre] || [];
    }

    const metas = await Promise.all(rawData.map(async (item) => {
        const posterUrl = await getBestPoster(item.imdbId);
        
        return {
            id: item.imdbId,
            type: item.type || "movie",
            name: item.title,
            releaseInfo: String(item.year),
            poster: posterUrl,
            posterShape: "poster"
        };
    }));

    res.json({ metas });
});

app.get('/configure', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html'));
});

app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;