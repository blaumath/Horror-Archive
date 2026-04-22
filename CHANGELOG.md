## [13.2.3] - 2026-04-22

### 🐛 Fixed
- Restored Stremio-standard catalog types (`movie`/`series`) to improve scraper compatibility.
- Added `meta` as manifest resource with routes `/meta/:type/:id.json` and `/:configuration/meta/:type/:id.json`.
- Catalog route now validates requested type and supports `skip` pagination safely.

### ⚡ Improvements
- Added `/catalog-stats.json` (version, totals, per-catalog counts) for dynamic Configure UI counters.
- Added `npm run test:smoke` (`scripts/smokeTest.js`) covering manifest/catalog/meta/stats flows.
- Strengthened `validateCatalogs.js` with 4-digit year check, optional `type` check, cross-catalog duplicate warning, and timeline ordering warnings.

### 📦 Version Updates
- Bumped manifest ID/version to `com.horror.archive.v13.2.3` / `13.2.3`.

---

## [13.1.2] - 2026-04-20

### 🐛 Fixed
- Added support for configured catalog routes with URL prefix: `/:configuration/catalog/:type/:id.json` (in addition to `/catalog/:type/:id.json`).
- Fixed manifest behavior for invalid configuration strings: now returns an empty catalog list instead of falling back to all catalogs.

### 📦 Version Updates
- Bumped manifest ID/version to `com.horror.archive.v13.1.2` / `13.1.2`.

---

## [13.1.1] - 2026-04-20

### 🆕 Added
- **4 new horror TV series** to `Horror TV Series`: Channel Zero, Dead Set, Les Revenants (The Returned), and The Last of Us.
- Added `scripts/validateCatalogs.js` to validate catalog structure (`title`, IMDb format, year, and duplicate IDs in each catalog).

### ⚡ Quality Improvements
- Added `npm run validate:data` script for faster catalog QA before releases.
- Bumped manifest ID/version to `com.horror.archive.v13.1.1` / `13.1.1`.
- Updated Configure page version string and synced catalog counts with Data files (including `Horror TV Series` = 71).

---

## [13.1.0] - 2026-04-20

### 🐛 Fixed
- **Config Manifest Selection**: `/[catalog_ids]/manifest.json` now properly returns only selected catalogs from Configure page.
- **Addon Refresh**: Bumped manifest ID/version to force Stremio cache refresh after catalog updates.

### 🆕 Added
- **Alien & Predator Timeline** catalog (14 films) in chronological watch order.

### 🎨 UI/Documentation
- Updated Configure page to include the new Alien & Predator catalog.
- Updated Configure page stats/version from 24 to 25 catalogs.

---

## [13.0.0] - 2026-02-10

### 🆕 Added
- **Missing 2025 Films**:
  - Final Destination: Bloodlines (2025)
  - 28 Years Later (2025)
  - The Conjuring: Last Rites (2025)
  - Scream VII (2025)
  - M3GAN franchise (M3GAN 2023, M3GAN 2.0 2025)

### 🐛 Fixed
- **Critical**: Fixed V/H/S/85 IMDb ID (was tt27911000 - Terrifier 3's ID, corrected to tt21430952)
- **Vercel Compatibility**: Fixed `/configure` route to use `__dirname` instead of `process.cwd()`

### ⚡ Performance & Cleanup
- Removed unused `posterCache` variable and references
- Removed unused `metaCache` variable (no TMDB functionality in use)
- Removed unused `axios` dependency (no TMDB functionality in use)
- Removed unused `p-limit` dependency
- Removed unused `node-cache` dependency (no caching needed without meta functionality)
- Cleaner health check endpoint (removed unused cache statistics)

### 📦 Version Updates
- Updated manifest to v13.0.0
- Updated manifest ID to com.horror.archive.v13
