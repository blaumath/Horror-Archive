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

// Mapeamento dos Catálogos (Igual a Marvel faz internamente)
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
    id: "com.horror.archive.marvelstyle", 
    name: "Horror Archive",
    description: "The definitive horror archive.",
    version: "8.0.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    
    // O SEGREDO 1: Resources tem que ter 'catalog' E 'meta'
    resources: ["catalog", "meta"], 
    
    // O SEGREDO 2: Criamos um tipo só nosso para o menu principal
    types: ["Horror Archive", "movie", "series"], 
    
    // O SEGREDO 3: Definimos os catálogos EXPLÍCITOS aqui (Igual Marvel)
    // Em vez de usar filtros, declaramos cada linha que vai aparecer
    catalogs: Object.keys(catalogsData).map(key => ({
        type: "Horror Archive",
        id: key,
        name: catalogsData[key].name,
        extra: [] // Sem filtros, direto ao ponto!
    })),
    
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- FUNÇÃO DE BUSCA DO TMDB (Para Sinopse e Nota) ---
async function fetchFullMetadata(imdbId, type) {
    const cacheKey = `meta_${imdbId}`;
    const cached = posterCache.get(cacheKey);
    if (cached) return cached;

    if (!TMDB_API_KEY) return null;

    try {
        // Tenta adivinhar se é filme ou série se não vier especificado
        let searchType = type === 'series' ? 'tv' : 'movie';
        
        // 1. Acha o ID do TMDB
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
        const findRes = await axios.get(findUrl);
        
        // Verifica resultados
        const movieRes = findRes.data.movie_results[0];
        const tvRes = findRes.data.tv_results[0];
        const basic = movieRes || tvRes;
        
        // Corrige o tipo se o TMDB disser o contrário
        if (movieRes) searchType = 'movie';
        if (tvRes) searchType = 'tv';

        if (basic) {
            // 2. Busca detalhes
            const detailUrl = `https://api.themoviedb.org/3/${searchType}/${basic.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`;
            const d = (await axios.get(detailUrl)).data;

            const meta = {
                id: imdbId,
                type: searchType === 'tv' ? 'series' : 'movie',
                name: d.title || d.name,
                description: d.overview || "Sinopse indisponível no momento.",
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
        console.error("Erro TMDB:", e.message);
        return null; 
    }
}

// --- ROTAS ---

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(baseManifest);
});

// ROTA DE CATÁLOGO (Rápida e Leve)
app.get('/catalog/:type/:id.json', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    const catalogId = req.params.id;
    
    // Pega os dados do mapa de catálogos
    const catalogEntry = catalogsData[catalogId];
    
    if (!catalogEntry) {
        return res.json({ metas: [] });
    }

    const rawData = catalogEntry.data;

    const metas = rawData.map(item => ({
        id: item.imdbId,
        // IMPORTANTE: Aqui definimos se é filme ou série para o Stremio saber
        type: item.type || "movie", 
        name: item.title,
        releaseInfo: String(item.year),
        poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
        posterShape: "poster"
    }));

    res.json({ metas });
});

// ROTA DE METADADOS (O Stremio chama isso quando clica no poster)
app.get('/meta/:type/:id.json', async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    const { type, id } = req.params;
    const imdbId = id.replace('.json', '');
    
    const fullMeta = await fetchFullMetadata(imdbId, type);
    
    if (fullMeta) {
        res.json({ meta: fullMeta });
    } else {
        // Fallback para não quebrar
        res.json({ 
            meta: { 
                id: imdbId, 
                type: type,
                name: "Loading...", 
                description: "Dados não encontrados no TMDB." 
            } 
        });
    }
});

app.get('/configure', (req, res) => res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html')));
app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;