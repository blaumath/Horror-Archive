const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const NodeCache = require("node-cache");

const posterCache = new NodeCache({ stdTTL: 86400 });
const app = express();
app.use(cors());

// --- CHAVES DO VERCEL ---
const TMDB_API_KEY = process.env.TMDB_API_Key; 

// --- DADOS ---
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
    id: "com.horror.archive.v4", 
    name: "Horror Archive",
    description: "The definitive archive of horror sagas.",
    version: "4.1.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    // ADICIONADO: Agora o addon diz que também fornece metadados (detalhes)
    resources: ["catalog", "meta"], 
    types: ["Horror Archive", "movie", "series"], 
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- FUNÇÃO PARA PEGAR TUDO DO TMDB (POSTER + SINOPSE + ELENCO) ---
async function fetchFullMetadata(imdbId) {
    const cached = posterCache.get(imdbId);
    if (cached) return cached;

    try {
        // 1. Acha o ID do TMDB usando o IMDb ID
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl);
        const basic = findRes.data.movie_results[0] || findRes.data.tv_results[0];
        const type = findRes.data.movie_results[0] ? 'movie' : 'tv';

        if (basic) {
            // 2. Pega os detalhes completos (Gêneros, Duração, Elenco)
            const detailUrl = `https://api.themoviedb.org/3/${type}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
            const detailRes = await axios.get(detailUrl);
            const d = detailRes.data;

            const meta = {
                id: imdbId,
                type: type,
                name: d.title || d.name,
                description: d.overview,
                releaseInfo: (d.release_date || d.first_air_date || "").substring(0, 4),
                poster: `https://image.tmdb.org/t/p/w500${d.poster_path}`,
                background: `https://image.tmdb.org/t/p/original${d.backdrop_path}`,
                runtime: d.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}min` : d.episode_run_time ? `${d.episode_run_time[0]}min` : null,
                genres: d.genres.map(g => g.name),
                cast: d.credits.cast.slice(0, 5).map(c => c.name),
                imdbRating: d.vote_average.toFixed(1)
            };
            posterCache.set(imdbId, meta);
            return meta;
        }
    } catch (e) { console.error("TMDB Meta Error", e); }
    return null;
}

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    let manifest = { ...baseManifest };
    manifest.catalogs = [{
        type: "Horror Archive", 
        id: "horror_archive_main",
        name: "Sagas",
        extra: [{ name: "genre", options: Object.keys(genreMapper), isRequired: true }]
    }];
    res.json(manifest);
});

// ROTA DO CATÁLOGO (O que aparece na grade)
app.get('/catalog/:type/:id/:extra.json', async (req, res) => {
    const params = new URLSearchParams(req.params.extra.replace('.json', ''));
    const selectedGenre = params.get('genre');
    const rawData = genreMapper[selectedGenre] || [];

    const metas = await Promise.all(rawData.map(async (item) => {
        const fullMeta = await fetchFullMetadata(item.imdbId);
        return {
            id: item.imdbId,
            type: item.type || "movie",
            name: item.title,
            releaseInfo: String(item.year),
            poster: fullMeta ? fullMeta.poster : `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
            description: fullMeta ? fullMeta.description : "", // Mostra sinopse rápida na grade
            posterShape: "poster"
        };
    }));
    res.json({ metas });
});

// ROTA DE METADADOS (O que aparece na lateral quando você clica)
app.get('/meta/:type/:id.json', async (req, res) => {
    const fullMeta = await fetchFullMetadata(req.params.id.replace('.json', ''));
    if (fullMeta) {
        res.json({ meta: fullMeta });
    } else {
        res.status(404).json({ meta: {} });
    }
});

app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;