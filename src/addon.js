const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const NodeCache = require("node-cache");

const posterCache = new NodeCache({ stdTTL: 86400 });
const app = express();
app.use(cors());

// --- CHAVES (Exatamente como no seu print do Vercel) ---
const TMDB_API_KEY = process.env.TMDB_API_Key; 

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
    id: "com.horror.archive.v6", // MUDAMOS PARA V6 PARA RESETAR O CACHE DO STREMIO
    name: "Horror Archive",
    description: "The definitive horror archive.",
    version: "6.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog", "meta"], // AGORA O STREMIO VAI PEDIR A SINOPSE
    types: ["movie", "series"], // Tipos padrão para o painel lateral funcionar
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- FUNÇÃO QUE BUSCA TUDO NO TMDB (IGUAL MARVEL) ---
async function fetchFullMetadata(imdbId, type) {
    const cacheKey = `meta_${imdbId}`;
    const cached = posterCache.get(cacheKey);
    if (cached) return cached;

    if (!TMDB_API_KEY) return null;

    try {
        const tmdbType = type === 'series' ? 'tv' : 'movie';
        
        // 1. Busca o ID do TMDB
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl);
        const basic = findRes.data.movie_results[0] || findRes.data.tv_results[0];

        if (basic) {
            // 2. Busca detalhes completos (Sinopse, Elenco, Nota)
            const detailUrl = `https://api.themoviedb.org/3/${tmdbType}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
            const d = (await axios.get(detailUrl)).data;

            const meta = {
                id: imdbId,
                type: type,
                name: d.title || d.name,
                description: d.overview || "Sinopse em breve.",
                releaseInfo: (d.release_date || d.first_air_date || "").substring(0, 4),
                poster: `https://image.tmdb.org/t/p/w500${d.poster_path}`,
                background: `https://image.tmdb.org/t/p/original${d.backdrop_path}`,
                runtime: d.runtime ? `${d.runtime} min` : d.episode_run_time ? `${d.episode_run_time[0]} min` : "",
                genres: d.genres.map(g => g.name),
                cast: d.credits?.cast?.slice(0, 5).map(c => c.name) || [],
                imdbRating: d.vote_average ? d.vote_average.toFixed(1) : "N/A"
            };
            posterCache.set(cacheKey, meta);
            return meta;
        }
    } catch (e) { return null; }
}

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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
    const params = new URLSearchParams(req.params.extra.replace('.json', ''));
    const selectedGenre = params.get('genre');
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
    const { type, id } = req.params;
    const imdbId = id.replace('.json', '');
    const fullMeta = await fetchFullMetadata(imdbId, type);
    
    if (fullMeta) {
        res.json({ meta: fullMeta });
    } else {
        res.json({ meta: { id: imdbId, name: "Horror File", type: type } });
    }
});

app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;