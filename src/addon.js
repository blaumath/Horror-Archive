const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const NodeCache = require("node-cache");

// Cache de posters por 24 horas para economizar CPU do Vercel e chamadas de API
const posterCache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

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

// --- CONFIGURAÇÃO DAS CHAVES (Vercel Environment Variables) ---
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
    // Mudamos de .v3 para .v4 para forçar o Stremio a resetar tudo
    id: "com.horror.archive.v4", 
    name: "Horror Archive",
    description: "The definitive archive of horror sagas.",
    version: "4.0.0", // Versão nova para não ter erro
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog"],
    // Isso cria o menu "Marvel" no topo
    types: ["Horror Archive", "movie", "series"], 
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- SISTEMA INTELIGENTE DE POSTERS COM CACHE ---
async function getBestPoster(imdbId) {
    // Verifica se o link já está na memória
    const cachedPoster = posterCache.get(imdbId);
    if (cachedPoster) return cachedPoster;

    let posterUrl = `https://images.metahub.space/poster/medium/${imdbId}/img`; // Fallback inicial

    try {
        // 1. Tenta TMDB
        if (TMDB_API_KEY) {
            const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            const res = await axios.get(tmdbUrl);
            const movie = res.data.movie_results[0] || res.data.tv_results[0];
            if (movie && movie.poster_path) {
                posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            }
        } 
        // 2. Tenta OMDb se o TMDB falhar
        else if (OMDB_API_KEY) {
            const omdbUrl = `http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
            const res = await axios.get(omdbUrl);
            if (res.data && res.data.Poster && res.data.Poster !== "N/A") {
                posterUrl = res.data.Poster;
            }
        }
    } catch (e) {
        console.error(`Error fetching poster for ${imdbId}`);
    }

    // Guarda o resultado (mesmo que seja o fallback) no cache por 24h
    posterCache.set(imdbId, posterUrl);
    return posterUrl;
}

// --- ROTAS ---

// Rota do Manifest: Sem cache para garantir que atualizações de sagas apareçam rápido
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
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

// Rota do Catálogo: Cache de 1 hora para o Stremio não sobrecarregar o Vercel
app.get(['/catalog/:type/:id/:extra.json', '/catalog/:type/:id.json'], async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    
    const { type, extra } = req.params;
    let rawData = [];

    if (type === "Horror Archive" && extra) {
        const params = new URLSearchParams(extra.replace('.json', ''));
        const selectedGenre = params.get('genre');
        rawData = genreMapper[selectedGenre] || [];
    }

    // Processa os posters em paralelo para máxima velocidade
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