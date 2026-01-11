const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const NodeCache = require("node-cache");

const posterCache = new NodeCache({ stdTTL: 86400 });
const app = express();
app.use(cors());

// --- CHAVES ---
const TMDB_API_KEY = process.env.TMDB_API_Key;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

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

// --- FUNÇÃO DE BUSCA (OMDb + TMDB) ---
async function fetchFullMetadata(imdbId, type) {
    const cacheKey = `meta_${imdbId}`;
    const cached = posterCache.get(cacheKey);
    if (cached) return cached;

    try {
        // PRIMEIRA FONTE: OMDb (IMDB) - Dados Completos
        let omdbData = null;
        if (OMDB_API_KEY) {
            try {
                const omdbUrl = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}&plot=full`;
                const omdbRes = await axios.get(omdbUrl);
                if (omdbRes.data.Response === 'True') {
                    omdbData = omdbRes.data;
                }
            } catch (e) {
                console.log(`OMDb fetch error for ${imdbId}:`, e.message);
            }
        }

        // SEGUNDA FONTE: TMDB (para posters e imagens melhores)
        let tmdbData = null;
        if (TMDB_API_KEY) {
            try {
                const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
                const findRes = await axios.get(findUrl);
                const basic = findRes.data.movie_results[0] || findRes.data.tv_results[0];
                if (basic) {
                    const tmdbType = findRes.data.movie_results[0] ? 'movie' : 'tv';
                    const detailUrl = `https://api.themoviedb.org/3/${tmdbType}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
                    tmdbData = (await axios.get(detailUrl)).data;
                }
            } catch (e) {
                console.log(`TMDB fetch error for ${imdbId}:`, e.message);
            }
        }

        // COMBINAR DADOS: OMDb para sinopse/dados + TMDB para imagens
        if (omdbData || tmdbData) {
            const meta = {
                id: imdbId,
                type: type || (omdbData?.Type === 'series' ? 'series' : 'movie'),
                name: omdbData?.Title || tmdbData?.title || tmdbData?.name || "Horror Archive File",
                description: omdbData?.Plot || tmdbData?.overview || "Sinopse em breve.",
                releaseInfo: omdbData?.Year || (tmdbData?.release_date || tmdbData?.first_air_date || "").substring(0, 4),
                poster: tmdbData?.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                    : `https://images.metahub.space/poster/medium/${imdbId}/img`,
                background: tmdbData?.backdrop_path 
                    ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`
                    : undefined,
                runtime: omdbData?.Runtime || (tmdbData?.runtime ? `${tmdbData.runtime} min` : (tmdbData?.episode_run_time?.[0] ? `${tmdbData.episode_run_time[0]} min` : "")),
                genres: tmdbData?.genres?.map(g => g.name) || (omdbData?.Genre?.split(', ') || []),
                cast: tmdbData?.credits?.cast?.slice(0, 10).map(c => c.name) || (omdbData?.Actors?.split(', ').slice(0, 10) || []),
                imdbRating: omdbData?.imdbRating || (tmdbData?.vote_average ? tmdbData.vote_average.toFixed(1) : "N/A"),
                director: omdbData?.Director || tmdbData?.credits?.crew?.find(c => c.job === 'Director')?.name,
                writer: omdbData?.Writer || tmdbData?.credits?.crew?.find(c => c.job === 'Writer')?.name,
                imdbVotes: omdbData?.imdbVotes || "N/A",
                country: omdbData?.Country || tmdbData?.origin_country?.join(', ') || "N/A",
                awards: omdbData?.Awards || "N/A"
            };
            posterCache.set(cacheKey, meta);
            return meta;
        }
    } catch (e) {
        console.log(`Metadata fetch error for ${imdbId}:`, e.message);
        return null;
    }
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
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
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
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
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