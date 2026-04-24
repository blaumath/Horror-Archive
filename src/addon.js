const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const app = express();
app.use(cors());
app.use(compression());

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
const evilDeadSaga = require('../Data/evilDeadSaga');
const insidiousSaga = require('../Data/insidiousSaga');
const paranormalActivity = require('../Data/paranormalActivity');
const texasChainsawSaga = require('../Data/texasChainsawSaga');
const hellraiserSaga = require('../Data/hellraiserSaga');
const finalDestination = require('../Data/finalDestination');
const residentEvilSaga = require('../Data/residentEvilSaga');
const alienPredatorTimeline = require('../Data/alienPredatorTimeline');
const a24Horror = require('../Data/a24Horror');
const foundFootageHorror = require('../Data/foundFootageHorror');
const horrorClassics = require('../Data/horrorClassics');
const psychologicalHorror = require('../Data/psychologicalHorror');
const zombieHorror = require('../Data/zombieHorror');
const asianHorror = require('../Data/asianHorror');

const catalogsData = {
  halloween: { name: '🎃 Halloween Saga', data: halloweenRelease },
  friday_13th: { name: '🔪 Friday the 13th', data: fridayRelease },
  nightmare: { name: '💀 Nightmare on Elm St', data: nightmareRelease },
  scream: { name: '📞 Scream Saga', data: screamData },
  chucky_saga: { name: '🔴 Chucky Saga', data: chuckyRelease },
  saw: { name: '🧩 Saw Legacy', data: sawTimeline },
  evil_dead: { name: '📖 Evil Dead Saga', data: evilDeadSaga },
  texas_chainsaw: { name: '🪚 Texas Chainsaw', data: texasChainsawSaga },
  hellraiser: { name: '📦 Hellraiser', data: hellraiserSaga },
  conjuring_rel: { name: '👻 Conjuring (Release)', data: conjuringRelease },
  conjuring_time: { name: '⏳ Conjuring (Timeline)', data: conjuringTimeline },
  insidious: { name: '🚪 Insidious Universe', data: insidiousSaga },
  paranormal: { name: '📹 Paranormal Activity', data: paranormalActivity },
  modern_horror: { name: '🎬 Modern Horror Sagas', data: modernSagas },
  final_dest: { name: '💀 Final Destination', data: finalDestination },
  resident_evil: { name: '🧟 Resident Evil', data: residentEvilSaga },
  alien_predator_timeline: { name: '👽 Alien & Predator Timeline', data: alienPredatorTimeline },
  a24_horror: { name: '🎨 A24 & Indie Horror', data: a24Horror },
  classics: { name: '👑 Horror Classics (60s-00s)', data: horrorClassics },
  psychological: { name: '🧠 Psychological Horror', data: psychologicalHorror },
  found_footage: { name: '📼 Found Footage', data: foundFootageHorror },
  zombies: { name: '🧟‍♂️ Zombie Films', data: zombieHorror },
  asian_horror: { name: '🎌 Asian Horror (J-Horror/K-Horror)', data: asianHorror },
  stephen_king: { name: '📚 Stephen King Collection', data: stephenKingCollection },
  horror_series: { name: '📺 Horror TV Series', data: horrorSeries }
};

const detectCatalogType = (items = []) => (
  items.length > 0 && items.every((item) => item.type === 'series') ? 'series' : 'movie'
);

const catalogTypeById = Object.fromEntries(
  Object.entries(catalogsData).map(([id, entry]) => [id, detectCatalogType(entry.data)])
);

const buildCatalogEntry = (id) => ({
  type: catalogTypeById[id] || 'movie',
  id,
  name: catalogsData[id].name,
  extra: [{ name: 'skip', isRequired: false }]
});

const buildMeta = (item, fallbackType = 'movie') => ({
  id: item.imdbId,
  type: item.type || fallbackType,
  name: item.title,
  releaseInfo: String(item.year),
  poster: `https://images.metahub.space/poster/medium/${item.imdbId}/img`,
  posterShape: 'poster'
});

const metasByCatalogId = Object.fromEntries(
  Object.entries(catalogsData).map(([id, entry]) => [
    id,
    entry.data.map((item) => buildMeta(item, catalogTypeById[id]))
  ])
);

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

const parseSelectedCatalogs = (configuration = '') => {
  if (typeof configuration !== 'string' || !configuration) return null;

  const selected = configuration
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id && catalogsData[id]);

  const uniqueSelected = Array.from(new Set(selected));
  return uniqueSelected.length > 0 ? uniqueSelected : null;
};

const resolveAllowedCatalogIds = (configuration) => (
  parseSelectedCatalogs(configuration) || Object.keys(catalogsData)
);

const baseManifest = {
  id: 'com.horror.archive.v13.2.3',
  name: '🎬 Horror Archive',
  description: 'The Ultimate Horror Collection - Curated by IMDb IDs | Fast & Compatible',
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
    p2p: false
  }
};

const buildManifest = (configuration) => {
  const selectedCatalogs = parseSelectedCatalogs(configuration);
  const activeCatalogIds = selectedCatalogs === null ? Object.keys(catalogsData) : selectedCatalogs;

  return {
    ...baseManifest,
    catalogs: activeCatalogIds.map(buildCatalogEntry)
  };
};

const catalogStats = Object.fromEntries(
  Object.entries(catalogsData).map(([id, entry]) => [id, entry.data.length])
);
const totalCatalogs = Object.keys(catalogsData).length;
const totalEntries = Object.values(catalogStats).reduce((sum, count) => sum + count, 0);
const CATALOG_PAGE_SIZE = 100;

const parseSkip = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

app.get(['/manifest.json', '/:configuration/manifest.json'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.json(buildManifest(req.params.configuration));
});

app.get(['/catalog/:type/:id.json', '/:configuration/catalog/:type/:id.json'], (req, res) => {
  res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');

  const allowedCatalogIds = resolveAllowedCatalogIds(req.params.configuration);
  if (!allowedCatalogIds.includes(req.params.id)) {
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

app.get(['/meta/:type/:id.json', '/:configuration/meta/:type/:id.json'], (req, res) => {
  res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=86400');

  const allowedCatalogIds = resolveAllowedCatalogIds(req.params.configuration);
  const metaCatalogIds = catalogIdsByMetaId[req.params.id];
  const isAllowedMeta = metaCatalogIds && allowedCatalogIds.some((catalogId) => metaCatalogIds.has(catalogId));

  const meta = metaById[req.params.id];
  if (!meta || req.params.type !== meta.type || !isAllowedMeta) {
    return res.status(404).json({ meta: null });
  }

  return res.json({ meta });
});

app.get('/catalog-stats.json', (req, res) => {
  res.setHeader('Cache-Control', 'max-age=300, stale-while-revalidate=3600');
  return res.json({
    version: baseManifest.version,
    totalCatalogs,
    totalEntries,
    catalogStats
  });
});

app.get('/configure', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'configure.html'));
});

app.get('/', (req, res) => res.redirect('/configure'));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    version: baseManifest.version,
    catalogs: totalCatalogs,
    entries: totalEntries
  });
});

module.exports = app;
