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

const catalogsData = {
    "chucky_saga": { name: "Chucky Saga", data: chuckyRelease },
    "conjuring_rel": { name: "Conjuring (Release)", data: conjuringRelease },
    "conjuring_time": { name: "Conjuring (Timeline)", data: conjuringTimeline },
    "friday_13th": { name: "Friday the 13th", data: fridayRelease },
    "halloween": { name: "Halloween", data: halloweenRelease },
    "nightmare": { name: "Nightmare on Elm St", data: nightmareRelease },
    "saw": { name: "Saw Legacy", data: sawTimeline },
    "scream": { name: "Scream Saga", data: screamData },
    "stephen_king": { name: "Stephen King", data: stephenKingCollection },
    "modern_horror": { name: "Modern Horror", data: modernSagas },
    "horror_series": { name: "Horror TV Series", data: horrorSeries }
};

const baseManifest = {
    id: "com.horror.archive.v11", // MUDAMOS O ID PARA RESETAR TUDO
    name: "Horror Archive",
    description: "The definitive horror archive.",
    version: "11.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog", "meta"], 
    types: ["movie", "series", "Horror Archive"], 
    // VOLTAMOS PARA O TT: Isso faz o Torrentio e outros funcionarem!
    idPrefixes: ["tt"], 
    catalogs: Object.keys(catalogsData).map(key => ({
        type: "Horror Archive",
        id: key,
        name: catalogsData[key].name
    })),
    behaviorHints: { configurable: true, configurationRequired: false }
};

async function fetchFullMetadata(imdbId, type) {
    const cacheKey = `meta_${imdbId}`;
    const cached = posterCache.get(cacheKey);
    if (cached) return cached;

    if (!TMDB_API_KEY) return null;

    try {
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl);
        const basic = findRes.data.movie_results[0] || findRes.data.tv_results[0];
        const tmdbType = findRes.data.movie_results[0] ? 'movie' : 'tv';

        if (basic) {
            const detailUrl = `https://api.themoviedb.org/3/${tmdbType}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
            const d = (await axios.get(detailUrl)).data;

            const meta = {
                id: imdbId,
                type: tmdbType === 'tv' ? 'series' : 'movie',
                name: d.title || d.name,
                description: d.overview || "Sinopse indisponível.",
                releaseInfo: (d.release_date || d.first_air_date || "").substring(0, 4),
                poster: `https://image.tmdb.org/t/p/w500${d.poster_path}`,
                background: `https://image.tmdb.org/t/p/original${d.backdrop_path}`,
                runtime: d.runtime ? `${d.runtime} min` : null,
                genres: d.genres.map(g => g.name),
                cast: d.credits?.cast?.slice(0, 5).map(c => c.name) || [],
                imdbRating: d.vote_average ? d.vote_average.toFixed(1) : "N/A"
            };
            posterCache.set(cacheKey, meta);
            return meta;
        }
    } catch (e) { return null; }
}

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(baseManifest);
});

app.get('/catalog/:type/:id.json', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    const catalogEntry = catalogsData[req.params.id];
    if (!catalogEntry) return res.json({ metas: [] });

    const metas = catalogEntry.data.map(item => ({
        id: item.imdbId, // ID PURO (tt...) PARA OS LINKS FUNCIONAREM
        type: item.type || "movie", 
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));
    res.json({ metas });
});

app.get('/meta/:type/:id.json', async (req, res) => {
    const imdbId = req.params.id.replace('.json', '');
    const fullMeta = await fetchFullMetadata(imdbId, req.params.type);
    
    if (fullMeta) {
        res.json({ meta: fullMeta });
    } else {
        res.json({ meta: { id: imdbId, type: req.params.type, name: "Horror Archive" } });
    }
});

app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;
