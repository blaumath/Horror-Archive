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
    id: "com.horror.archive.v7", // NOVO ID PARA RESETAR TUDO DE VEZ
    name: "Horror Archive",
    description: "The definitive horror archive - Marvel Style.",
    version: "7.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    // RECURSOS: Adicionamos o 'meta' para habilitar a lateral
    resources: ["catalog", "meta"], 
    // TIPOS: Precisamos incluir o tipo customizado e os padrões
    types: ["Horror Archive", "movie", "series"], 
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- FUNÇÃO DE BUSCA (TMDB) ---
async function fetchFullMetadata(imdbId) {
    const cached = posterCache.get(imdbId);
    if (cached) return cached;

    try {
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl);
        const basic = findRes.data.movie_results[0] || findRes.data.tv_results[0];
        const type = findRes.data.movie_results[0] ? 'movie' : 'tv';

        if (basic) {
            const detailUrl = `https://api.themoviedb.org/3/${type}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
            const d = (await axios.get(detailUrl)).data;

            const meta = {
                id: imdbId,
                type: type === 'tv' ? 'series' : 'movie',
                name: d.title || d.name,
                description: d.overview || "Sinopse em breve.",
                releaseInfo: (d.release_date || d.first_air_date || "").substring(0, 4),
                poster: `https://image.tmdb.org/t/p/w500${d.poster_path}`,
                background: `https://image.tmdb.org/t/p/original${d.backdrop_path}`,
                runtime: d.runtime ? `${d.runtime} min` : "",
                genres: d.genres.map(g => g.name),
                cast: d.credits?.cast?.slice(0, 5).map(c => c.name) || [],
                imdbRating: d.vote_average ? d.vote_average.toFixed(1) : "N/A"
            };
            posterCache.set(imdbId, meta);
            return meta;
        }
    } catch (e) { return null; }
}

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    let manifest = { ...baseManifest };
    manifest.catalogs = [{
        // O SEGREDO: O type do catálogo deve bater com o que definimos acima
        type: "Horror Archive", 
        id: "horror_archive_main",
        name: "Sagas",
        extra: [{ name: "genre", options: Object.keys(genreMapper), isRequired: true }]
    }];
    res.json(manifest);
});

app.get('/catalog/:type/:id/:extra.json', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    const params = new URLSearchParams(req.params.extra.replace('.json', ''));
    const selectedGenre = params.get('genre');
    const rawData = genreMapper[selectedGenre] || [];

    const metas = rawData.map(item => ({
        id: item.imdbId,
        type: "movie", // Forçamos movie aqui para o player e a meta funcionarem
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));
    res.json({ metas });
});

// ROTA META: O Stremio chama isso quando você clica no filme
app.get('/meta/:type/:id.json', async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    const imdbId = req.params.id.replace('.json', '');
    const fullMeta = await fetchFullMetadata(imdbId);
    
    if (fullMeta) {
        res.json({ meta: fullMeta });
    } else {
        res.json({ meta: { id: imdbId, name: "Horror Archive File", type: req.params.type } });
    }
});

app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;