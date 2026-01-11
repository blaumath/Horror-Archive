const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const NodeCache = require("node-cache");

const posterCache = new NodeCache({ stdTTL: 86400 });
const app = express();
app.use(cors());

// --- CHAVES ---
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

console.log('TMDB API Key loaded:', TMDB_API_KEY ? 'YES' : 'NO');
console.log('OMDb API Key loaded:', OMDB_API_KEY ? 'YES' : 'NO');

// --- IMPORTAÇÕES ---
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
    id: "com.horror.archive.v7",
    name: "Horror Archive",
    description: "The definitive horror archive.",
    version: "7.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog", "meta"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- FUNÇÃO QUE BUSCA TUDO NO TMDB + OMDb ---
async function fetchFullMetadata(imdbId, type) {
    const cacheKey = `meta_${imdbId}`;
    const cached = posterCache.get(cacheKey);
    if (cached) return cached;

    if (!TMDB_API_KEY) {
        console.warn('TMDB API Key not found');
        return null;
    }

    try {
        const tmdbType = type === 'series' ? 'tv' : 'movie';
        
        // 1. Busca no OMDb primeiro (para sinopse e dados completos)
        let omdbData = null;
        if (OMDB_API_KEY) {
            try {
                const omdbUrl = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}&plot=full`;
                const omdbRes = await axios.get(omdbUrl);
                if (omdbRes.data.Response === 'True') {
                    omdbData = omdbRes.data;
                    console.log(`OMDb data found for ${imdbId}: ${omdbData.Title}`);
                }
            } catch (e) {
                console.log(`OMDb fetch error for ${imdbId}:`, e.message);
            }
        }

        // 2. Busca o ID do TMDB para imagens melhores
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl);
        const basic = findRes.data.movie_results[0] || findRes.data.tv_results[0];

        if (!basic) {
            console.warn(`No TMDB data found for ${imdbId}`);
            return null;
        let tmdbData = null;
        if (TMDB_API_KEY) {
            try {
                const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
                const findRes = await axios.get(findUrl);
        // 3. Busca detalhes completos no TMDB
        const detailUrl = `https://api.themoviedb.org/3/${tmdbType}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
        const d = (await axios.get(detailUrl)).data;

        // Combinar dados: OMDb para sinopse/dados + TMDB para imagens
        const meta = {
            id: imdbId,
            type: type,
            name: omdbData?.Title || d.title || d.name,
            description: omdbData?.Plot || d.overview || "Sinopse em breve.",
            releaseInfo: (omdbData?.Year || (d.release_date || d.first_air_date || "").substring(0, 4)),
            poster: `https://image.tmdb.org/t/p/w500${d.poster_path}`,
            background: `https://image.tmdb.org/t/p/original${d.backdrop_path}`,
            runtime: omdbData?.Runtime || (d.runtime ? `${d.runtime} min` : d.episode_run_time ? `${d.episode_run_time[0]} min` : ""),
            genres: d.genres.map(g => g.name),
            cast: d.credits?.cast?.slice(0, 10).map(c => c.name) || [],
            imdbRating: omdbData?.imdbRating || (d.vote_average ? d.vote_average.toFixed(1) : "N/A"),
            director: omdbData?.Director || d.credits?.crew?.find(c => c.job === 'Director')?.name,
            writer: omdbData?.Writer || d.credits?.crew?.find(c => c.job === 'Writer')?.name,
            country: omdbData?.Country || d.origin_country?.join(', ') || "N/A",
            awards: omdbData?.Awards || "N/A"
        };
        
        posterCache.set(cacheKey, meta);
        console.log(`Metadata fetched for ${imdbId}: ${meta.name}`);
        return meta;
    } catch (e) { 
        console.error(`Error fetching metadata for ${imdbId}:`, e.message);
        return null;
    }
}

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600');
    let manifest = { ...baseManifest };
    manifest.catalogs = [
        {
            type: "movie", 
            id: "horror_movies",
            name: "Horror Archive",
            extra: [{ name: "genre", options: Object.keys(genreMapper).filter(g => g !== "Horror TV Series"), isRequired: true }]
        },
        {
            type: "series", 
            id: "horror_tv",
            name: "Horror Series",
            extra: [{ name: "genre", options: ["Horror TV Series"], isRequired: true }]
        }
    ];
    res.json(manifest);
});

app.get('/catalog/:type/:id/:extra.json', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600');
    const extra = req.params.extra.replace('.json', '');
    const genreMatch = extra.match(/genre=([^&]+)/);
    const selectedGenre = genreMatch ? decodeURIComponent(genreMatch[1]) : null;
    
    console.log('Requesting catalog for genre:', selectedGenre);
    
    const rawData = genreMapper[selectedGenre] || [];

    const metas = rawData.map(item => ({
        id: item.imdbId,
        type: req.params.type,
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));
    
    res.json({ metas });
});

app.get('/meta/:type/:id.json', async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600');
    const { type, id } = req.params;
    const imdbId = id.replace('.json', '');
    
    console.log(`Fetching metadata for ${imdbId} (${type})`);
    
    const fullMeta = await fetchFullMetadata(imdbId, type);
    
    if (fullMeta) {
        res.json({ meta: fullMeta });
    } else {
        res.json({ meta: { id: imdbId, name: "Horror File", type: type, description: "Sinopse indisponível" } });
    }
});

app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;