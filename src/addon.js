const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const NodeCache = require("node-cache");
const compression = require('compression');

// --- CACHE CONFIGURAÇÃO (24h para posters, 1h para metadados) ---
const posterCache = new NodeCache({ stdTTL: 86400 }); // 24 horas
const metaCache = new NodeCache({ stdTTL: 3600 }); // 1 hora

const app = express();
app.use(cors());
app.use(compression()); // COMPRESSÃO GZIP/BROTLI

// --- CHAVES ---
const TMDB_API_KEY = process.env.TMDB_API_Key; 

// --- IMPORTAR TODOS OS CATÁLOGOS ---
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

// --- NOVOS CATÁLOGOS ---
const evilDeadSaga = require('../Data/evilDeadSaga');
const insidiousSaga = require('../Data/insidiousSaga');
const paranormalActivity = require('../Data/paranormalActivity');
const texasChainsawSaga = require('../Data/texasChainsawSaga');
const hellraiserSaga = require('../Data/hellraiserSaga');
const finalDestination = require('../Data/finalDestination');
const residentEvilSaga = require('../Data/residentEvilSaga');
const a24Horror = require('../Data/a24Horror');
const foundFootageHorror = require('../Data/foundFootageHorror');
const horrorClassics = require('../Data/horrorClassics');
const psychologicalHorror = require('../Data/psychologicalHorror');
const zombieHorror = require('../Data/zombieHorror');
const asianHorror = require('../Data/asianHorror');

// --- CONFIGURAÇÃO DE CATÁLOGOS ---
const catalogsData = {
    // FRANQUIAS CLÁSSICAS
    "halloween": { name: "🎃 Halloween Saga", data: halloweenRelease },
    "friday_13th": { name: "🔪 Friday the 13th", data: fridayRelease },
    "nightmare": { name: "💀 Nightmare on Elm St", data: nightmareRelease },
    "scream": { name: "📞 Scream Saga", data: screamData },
    "chucky_saga": { name: "🔴 Chucky Saga", data: chuckyRelease },
    "saw": { name: "🧩 Saw Legacy", data: sawTimeline },
    "evil_dead": { name: "📖 Evil Dead Saga", data: evilDeadSaga },
    "texas_chainsaw": { name: "🪚 Texas Chainsaw", data: texasChainsawSaga },
    "hellraiser": { name: "📦 Hellraiser", data: hellraiserSaga },
    
    // UNIVERSOS CINEMATOGRÁFICOS
    "conjuring_rel": { name: "👻 Conjuring (Release)", data: conjuringRelease },
    "conjuring_time": { name: "⏳ Conjuring (Timeline)", data: conjuringTimeline },
    "insidious": { name: "🚪 Insidious Universe", data: insidiousSaga },
    "paranormal": { name: "📹 Paranormal Activity", data: paranormalActivity },
    
    // SAGAS MODERNAS
    "modern_horror": { name: "🎬 Modern Horror Sagas", data: modernSagas },
    "final_dest": { name: "💀 Final Destination", data: finalDestination },
    "resident_evil": { name: "🧟 Resident Evil", data: residentEvilSaga },
    "a24_horror": { name: "🎨 A24 & Indie Horror", data: a24Horror },
    
    // POR GÊNERO
    "classics": { name: "👑 Horror Classics (60s-00s)", data: horrorClassics },
    "psychological": { name: "🧠 Psychological Horror", data: psychologicalHorror },
    "found_footage": { name: "📼 Found Footage", data: foundFootageHorror },
    "zombies": { name: "🧟‍♂️ Zombie Films", data: zombieHorror },
    "asian_horror": { name: "🎌 Asian Horror (J-Horror/K-Horror)", data: asianHorror },
    
    // AUTORES E SÉRIES
    "stephen_king": { name: "📚 Stephen King Collection", data: stephenKingCollection },
    "horror_series": { name: "📺 Horror TV Series", data: horrorSeries }
};

// --- MANIFEST BASE ---
const baseManifest = {
    id: "com.horror.archive.v12",
    name: "🎬 Horror Archive",
    description: "The Ultimate Horror Collection - 500+ Films & Series | Optimized & Complete",
    version: "12.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog", "meta"], 
    types: ["movie", "series", "Horror Archive"], 
    idPrefixes: ["tt"], 
    catalogs: Object.keys(catalogsData).map(key => ({
        type: "Horror Archive",
        id: key,
        name: catalogsData[key].name,
        extra: [
            { name: "skip", isRequired: false }
        ]
    })),
    behaviorHints: { 
        configurable: true, 
        configurationRequired: false,
        adult: false,
        p2p: false
    }
};

// --- FUNÇÃO OTIMIZADA PARA BUSCAR METADADOS DO TMDB ---
async function fetchFullMetadata(imdbId, type) {
    const cacheKey = `meta_${imdbId}`;
    const cached = metaCache.get(cacheKey);
    if (cached) return cached;

    if (!TMDB_API_KEY) return null;

    try {
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl, { timeout: 5000 });
        const basic = findRes.data.movie_results[0] || findRes.data.tv_results[0];
        const tmdbType = findRes.data.movie_results[0] ? 'movie' : 'tv';

        if (basic) {
            const detailUrl = `https://api.themoviedb.org/3/${tmdbType}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,keywords&language=pt-BR`;
            const d = (await axios.get(detailUrl, { timeout: 5000 })).data;

            const meta = {
                id: imdbId,
                type: tmdbType === 'tv' ? 'series' : 'movie',
                name: d.title || d.name,
                description: d.overview || "Sinopse indisponível.",
                releaseInfo: (d.release_date || d.first_air_date || "").substring(0, 4),
                poster: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : `https://images.metahub.space/poster/medium/${imdbId}/img`,
                background: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null,
                runtime: d.runtime ? `${d.runtime} min` : null,
                genres: d.genres?.map(g => g.name) || [],
                cast: d.credits?.cast?.slice(0, 5).map(c => c.name) || [],
                director: d.credits?.crew?.find(p => p.job === 'Director')?.name || null,
                imdbRating: d.vote_average ? d.vote_average.toFixed(1) : "N/A",
                popularity: d.popularity || 0
            };
            
            metaCache.set(cacheKey, meta);
            return meta;
        }
    } catch (e) { 
        console.error(`Error fetching metadata for ${imdbId}:`, e.message);
        return null; 
    }
}

// --- ROTAS ---

// Manifest
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    res.json(baseManifest);
});

// Catálogos
app.get('/catalog/:type/:id.json', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json');
    
    const catalogEntry = catalogsData[req.params.id];
    if (!catalogEntry) return res.json({ metas: [] });

    const metas = catalogEntry.data.map(item => ({
        id: item.imdbId,
        type: item.type || "movie", 
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));
    
    res.json({ metas });
});

// Metadados detalhados
app.get('/meta/:type/:id.json', async (req, res) => {
    const imdbId = req.params.id.replace('.json', '');
    const fullMeta = await fetchFullMetadata(imdbId, req.params.type);
    
    if (fullMeta) {
        res.setHeader('Cache-Control', 'max-age=3600');
        res.json({ meta: fullMeta });
    } else {
        res.json({ 
            meta: { 
                id: imdbId, 
                type: req.params.type, 
                name: "Horror Archive",
                poster: `https://images.metahub.space/poster/medium/${imdbId}/img`
            } 
        });
    }
});

// Página de configuração
app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        version: baseManifest.version,
        catalogs: Object.keys(catalogsData).length,
        cacheSize: {
            meta: metaCache.keys().length,
            poster: posterCache.keys().length
        }
    });
});

module.exports = app;
