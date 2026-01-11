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

// Mapa de Catálogos
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
    id: "com.horror.archive.v9", // Versão 9 para limpar tudo
    name: "Horror Archive",
    description: "The definitive horror archive.",
    version: "9.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog", "meta"], 
    types: ["Horror Archive", "movie", "series"], 
    
    // TRUQUE DA MARVEL: Prefixo próprio para o Stremio não usar o Cinemeta
    idPrefixes: ["ha:"], 

    catalogs: Object.keys(catalogsData).map(key => ({
        type: "Horror Archive",
        id: key,
        name: catalogsData[key].name,
        extra: []
    })),
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- FUNÇÃO DE BUSCA DO TMDB ---
async function fetchFullMetadata(uniqueId) {
    // Remove o prefixo "ha:" para buscar no TMDB
    const imdbId = uniqueId.replace("ha:", "");
    
    const cacheKey = `meta_${imdbId}`;
    const cached = posterCache.get(cacheKey);
    if (cached) return cached;

    if (!TMDB_API_KEY) return null;

    try {
        // Tenta achar pelo ID
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl);
        
        const movieRes = findRes.data.movie_results[0];
        const tvRes = findRes.data.tv_results[0];
        const basic = movieRes || tvRes;
        const type = tvRes ? 'tv' : 'movie';

        if (basic) {
            const detailUrl = `https://api.themoviedb.org/3/${type}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
            const d = (await axios.get(detailUrl)).data;

            const meta = {
                id: uniqueId, // Retorna o ID com prefixo
                type: type === 'tv' ? 'series' : 'movie',
                name: d.title || d.name,
                description: d.overview || "Sinopse indisponível.",
                releaseInfo: (d.release_date || d.first_air_date || "").substring(0, 4),
                poster: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
                background: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null,
                runtime: d.runtime ? `${d.runtime} min` : null,
                genres: d.genres ? d.genres.map(g => g.name) : [],
                cast: d.credits?.cast?.slice(0, 5).map(c => c.name) || [],
                imdbRating: d.vote_average ? d.vote_average.toFixed(1) : "N/A"
            };
            
            posterCache.set(cacheKey, meta);
            return meta;
        }
    } catch (e) { 
        console.error("Erro API:", e.message);
        return null; 
    }
}

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(baseManifest);
});

// CATÁLOGO
app.get('/catalog/:type/:id.json', (req, res) => {
    const catalogId = req.params.id;
    const catalogEntry = catalogsData[catalogId];
    
    if (!catalogEntry) return res.json({ metas: [] });

    const metas = catalogEntry.data.map(item => ({
        // AQUI ESTÁ O TRUQUE: Adicionamos "ha:" na frente do ID
        id: `ha:${item.imdbId}`,
        type: item.type || "movie", 
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));

    res.json({ metas });
});

// META (Detalhes)
app.get('/meta/:type/:id.json', async (req, res) => {
    const uniqueId = req.params.id.replace('.json', '');
    
    // Se o Stremio pedir sem o prefixo, ignoramos (para não dar conflito)
    if (!uniqueId.startsWith("ha:")) {
        return res.json({ meta: { id: uniqueId, name: "Use Horror Archive Category", type: "movie" } });
    }

    const fullMeta = await fetchFullMetadata(uniqueId);
    
    if (fullMeta) {
        res.json({ meta: fullMeta });
    } else {
        res.json({ 
            meta: { 
                id: uniqueId, 
                type: "movie",
                name: "Erro de Dados", 
                description: "Não foi possível carregar os dados do TMDB. Verifique a chave API." 
            } 
        });
    }
});

app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;