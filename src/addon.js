const express = require('express');
const cors = require('cors');
const path = require('path');

// --- IMPORTAÇÃO DE DADOS ---
// Certifique-se de que os caminhos dos arquivos estão corretos no seu projeto
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

// Mapeamento para facilitar a unificação
const catalogMapper = {
    "ck": chuckyRelease,
    "cj-r": conjuringRelease,
    "cj-t": conjuringTimeline,
    "f13": fridayRelease,
    "hw": halloweenRelease,
    "tv": horrorSeries,
    "ms": modernSagas,
    "nm": nightmareRelease,
    "sw": sawTimeline,
    "sc": screamData,
    "sk": stephenKingCollection
};

const baseManifest = {
    id: "com.blaumath.horror.legends.final", 
    name: "Horror Legends",
    description: "The definitive archive of horror sagas.",
    version: "1.5.0",
    logo: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png",
    background: "https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png",
    resources: ["catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    // Esta configuração cria a entrada na barra lateral (Discover)
    catalogs: [
        {
            type: "movie",
            id: "all_horror_movies",
            name: "Horror Legends", // O nome que aparecerá ao lado de Marvel/DC
            extra: [{ name: "search", isRequired: false }]
        }
    ],
    behaviorHints: { configurable: true, configurationRequired: false }
};

// --- ROTAS ---

// Rota do Manifest
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    res.json(baseManifest);
});

// Rota do Catálogo (Onde os filmes são listados)
app.get(['/catalog/:type/:id.json', '/:configuration/catalog/:type/:id.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    
    const type = req.params.type;
    const catalogId = req.params.id.replace('.json', '');

    // Verifica se o ID do catálogo é o que definimos no manifest
    if (catalogId === "all_horror_movies") {
        
        // 1. Junta todos os arquivos JSON em uma lista só
        let allItems = Object.values(catalogMapper).flat();

        // 2. Filtra para mostrar apenas Filmes (ou Séries, dependendo da aba)
        const filteredItems = allItems.filter(item => {
            const itemType = item.type || "movie";
            return itemType === type;
        });

        // 3. Formata para o padrão do Stremio
        const metas = filteredItems.map(item => ({
            id: item.imdbId,
            type: item.type || "movie",
            name: item.title,
            releaseInfo: String(item.year),
            poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
            posterShape: "poster"
        }));

        return res.json({ metas });
    }

    // Retorna vazio se o ID não bater
    res.status(404).json({ metas: [] });
});

// Rota de Configuração (Opcional)
app.get('/configure', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'public', 'configure.html'));
});

app.get('/', (req, res) => res.redirect('/configure'));

module.exports = app;