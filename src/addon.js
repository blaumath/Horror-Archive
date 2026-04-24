'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const app = express();
app.use(cors());
app.use(compression());

// ─── CATÁLOGOS ────────────────────────────────────────────────────────────────
const chuckyRelease         = require('../Data/chuckyRelease');
const conjuringRelease      = require('../Data/conjuringRelease');
const conjuringTimeline     = require('../Data/conjuringTimeline');
const fridayRelease         = require('../Data/fridayRelease');
const halloweenRelease      = require('../Data/halloweenRelease');
const horrorSeries          = require('../Data/horrorSeries');
const modernSagas           = require('../Data/modernSagas');
const nightmareRelease      = require('../Data/nightmareRelease');
const sawTimeline           = require('../Data/sawTimeline');
const screamData            = require('../Data/screamData');
const stephenKingCollection = require('../Data/stephenKingCollection');
const evilDeadSaga          = require('../Data/evilDeadSaga');
const insidiousSaga         = require('../Data/insidiousSaga');
const paranormalActivity    = require('../Data/paranormalActivity');
const texasChainsawSaga     = require('../Data/texasChainsawSaga');
const hellraiserSaga        = require('../Data/hellraiserSaga');
const finalDestination      = require('../Data/finalDestination');
const residentEvilSaga      = require('../Data/residentEvilSaga');
const alienPredatorTimeline = require('../Data/alienPredatorTimeline');
const a24Horror             = require('../Data/a24Horror');
const foundFootageHorror    = require('../Data/foundFootageHorror');
const horrorClassics        = require('../Data/horrorClassics');
const psychologicalHorror   = require('../Data/psychologicalHorror');
const zombieHorror          = require('../Data/zombieHorror');
const asianHorror           = require('../Data/asianHorror');

// ─── MAPA DE CATÁLOGOS ────────────────────────────────────────────────────────
const catalogsData = {
    // Slashers clássicos
    halloween:          { name: '🎃 Halloween Saga',              data: halloweenRelease },
    friday_13th:        { name: '🔪 Friday the 13th',             data: fridayRelease },
    nightmare:          { name: '💀 Nightmare on Elm St',         data: nightmareRelease },
    scream:             { name: '📞 Scream Saga',                  data: screamData },
    chucky_saga:        { name: '🔴 Chucky Saga',                  data: chuckyRelease },
    saw:                { name: '🧩 Saw Legacy',                   data: sawTimeline },
    evil_dead:          { name: '📖 Evil Dead Saga',               data: evilDeadSaga },
    texas_chainsaw:     { name: '🪚 Texas Chainsaw',              data: texasChainsawSaga },
    hellraiser:         { name: '📦 Hellraiser',                   data: hellraiserSaga },

    // Universos cinematográficos
    conjuring_rel:      { name: '👻 Conjuring (Release)',         data: conjuringRelease },
    conjuring_time:     { name: '⏳ Conjuring (Timeline)',        data: conjuringTimeline },
    insidious:          { name: '🚪 Insidious Universe',          data: insidiousSaga },
    paranormal:         { name: '📹 Paranormal Activity',         data: paranormalActivity },

    // Sagas modernas
    modern_horror:              { name: '🎬 Modern Horror Sagas',          data: modernSagas },
    final_dest:                 { name: '💀 Final Destination',             data: finalDestination },
    resident_evil:              { name: '🧟 Resident Evil',                 data: residentEvilSaga },
    alien_predator_timeline:    { name: '👽 Alien & Predator Timeline',     data: alienPredatorTimeline },
    a24_horror:                 { name: '🎨 A24 & Indie Horror',            data: a24Horror },

    // Por gênero
    classics:       { name: '👑 Horror Classics (60s-00s)',           data: horrorClassics },
    psychological:  { name: '🧠 Psychological Horror',                data: psychologicalHorror },
    found_footage:  { name: '📼 Found Footage',                       data: foundFootageHorror },
    zombies:        { name: '🧟‍♂️ Zombie Films',                      data: zombieHorror },
    asian_horror:   { name: '🎌 Asian Horror (J-Horror/K-Horror)',    data: asianHorror },

    // Coleções especiais
    stephen_king:   { name: '📚 Stephen King Collection', data: stephenKingCollection },
    horror_series:  { name: '📺 Horror TV Series',        data: horrorSeries },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Detecta o tipo predominante de um catálogo (movie | series). */
const detectCatalogType = (items = []) =>
    items.length > 0 && items.every((item) => item.type === 'series') ? 'series' : 'movie';

const catalogTypeById = Object.fromEntries(
  Object.entries(catalogsData).map(([id, entry]) => [id, detectCatalogType(entry.data)])
);

const buildCatalogEntry = (id) => ({
    type: catalogTypeById[id] || 'movie',
    id,
    name: catalogsData[id].name,
    extra: [{ name: 'skip', isRequired: false }],
});

const buildMeta = (item, fallbackType = 'movie') => ({
    id: item.imdbId,
    type: item.type || fallbackType,
    name: item.title,
    releaseInfo: String(item.year),
    poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
    posterShape: 'poster',
});

const buildMetas = (items, fallbackType) =>
    items.map((item) => buildMeta(item, fallbackType));

// Cache de metas por catálogo
const metasByCatalogId = Object.fromEntries(
    Object.entries(catalogsData).map(([id, entry]) => [
        id,
        buildMetas(entry.data, catalogTypeById[id]),
    ])
);

// Índice global de meta por IMDb ID (primeira ocorrência vence)
const metaById = Object.values(catalogsData).reduce((acc, catalog) => {
  const fallbackType = detectCatalogType(catalog.data);
  catalog.data.forEach((item) => {
    if (!acc[item.imdbId]) {
      acc[item.imdbId] = buildMeta(item, fallbackType);
    }
  });
  return acc;
}, {});

const catalogIdsByMetaId = Object.entries(catalogsData).reduce((acc, [catalogId, catalog]) => {
  catalog.data.forEach((item) => {
    if (!acc[item.imdbId]) {
      acc[item.imdbId] = new Set();
    }
    acc[item.imdbId].add(catalogId);
  });
  return acc;
}, {});

/** Retorna array de IDs de catálogos válidos a partir de uma string de configuração. */
const parseSelectedCatalogs = (configuration = '') => {
    if (!configuration || typeof configuration !== 'string') return null;
    const selected = configuration
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id && catalogsData[id]);
    return selected.length ? [...new Set(selected)] : null;
};

const parseSkip = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const CATALOG_PAGE_SIZE = 100;

// ─── MANIFEST ─────────────────────────────────────────────────────────────────
const baseManifest = {
    id: 'com.horror.archive.v13.2.3',
    name: '🎬 Horror Archive',
    description: 'The Ultimate Horror Collection — 460+ curated entries | IMDb-first | Fast & Compatible',
    version: '13.2.3',
    logo: 'https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/icon.png',
    background: 'https://raw.githubusercontent.com/blaumath/Horror-Archive/main/assets/background.png',
    resources: ['catalog', 'meta'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    catalogs: Object.keys(catalogsData).map(buildCatalogEntry),
    behaviorHints: {
        configurable: true,
        configurationRequired: false,
        adult: false,
        p2p: false,
    },
};

const buildManifest = (configuration) => {
    const selectedIds = parseSelectedCatalogs(configuration);
    const activeIds = selectedIds ?? Object.keys(catalogsData);
    return { ...baseManifest, catalogs: activeIds.map(buildCatalogEntry) };
};

// ─── STATS ────────────────────────────────────────────────────────────────────
const catalogStats = Object.fromEntries(
  Object.entries(catalogsData).map(([id, entry]) => [id, entry.data.length])
);
const totalCatalogs = Object.keys(catalogsData).length;
const totalEntries = Object.values(catalogStats).reduce((sum, n) => sum + n, 0);

// ─── ROTAS ────────────────────────────────────────────────────────────────────

// Manifest (com ou sem configuração no prefixo)
app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    res.json(buildManifest(req.params.configuration));
});

// Catálogos (com ou sem configuração no prefixo)
app.get(['/catalog/:type/:id.json', '/:configuration/catalog/:type/:id.json'], (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json');

    const catalogType = catalogTypeById[req.params.id];
    if (!catalogType || req.params.type !== catalogType) {
        return res.json({ metas: [] });
    }

  const catalogType = catalogTypeById[req.params.id];
  if (!catalogType || req.params.type !== catalogType) {
    return res.json({ metas: [] });
  }

  const skip = parseSkip(req.query.skip);
  const metas = metasByCatalogId[req.params.id].slice(skip, skip + CATALOG_PAGE_SIZE);
  return res.json({ metas });
});

// Meta (com ou sem configuração no prefixo)
app.get(['/meta/:type/:id.json', '/:configuration/meta/:type/:id.json'], (req, res) => {
  res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');

    const meta = metaById[req.params.id];
    if (!meta || req.params.type !== meta.type) {
        return res.status(404).json({ meta: null });
    }
    return res.json({ meta });
});

// Stats para a página de configuração
app.get('/catalog-stats.json', (_req, res) => {
    res.setHeader('Cache-Control', 'max-age=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    res.json({ version: baseManifest.version, totalCatalogs, totalEntries, catalogStats });
});

// Página de configuração
app.get('/configure', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'configure.html'));
});

app.get('/', (_req, res) => res.redirect('/configure'));

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', version: baseManifest.version, catalogs: totalCatalogs, entries: totalEntries });
});

module.exports = app;
