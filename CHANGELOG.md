# 📝 Changelog

All notable changes to Horror Archive will be documented in this file.

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
- Updated description to reflect 700+ films
- Updated package.json to v4.0.0

### 🎨 UI/Documentation
- Updated configure.html with v13.0.0 and 700+ films count
- Updated catalog counts in configure.html
- Updated README badges and statistics
- Updated decade range to 1960s - 2025
- Simplified Credits section in README

---

## [12.0.0] - 2025-02-09

### 🆕 Added
- **13 New Catalogs**:
  - Evil Dead Saga (5 films)
  - Insidious Universe (5 films)
  - Paranormal Activity (7 films)
  - Texas Chainsaw Massacre (9 films)
  - Hellraiser (11 films)
  - Final Destination (5 films)
  - Resident Evil (7 films)
  - A24 & Indie Horror (12 films)
  - Found Footage Horror (24 films)
  - Horror Classics (70+ films)
  - Psychological Horror (28 films)
  - Zombie Films (28 films)
  - Asian Horror (27 films - J-Horror & K-Horror)

- **New Features**:
  - Emoji icons for better catalog identification 🎃🔪👻
  - Health check endpoint (`/health`)
  - Director information in metadata
  - Keywords and popularity data from TMDB
  - Better error handling with timeouts
  - Cache statistics in health endpoint

### 🐛 Fixed
- **Critical**: Fixed IMDb ID bug in Conjuring Timeline (Annabelle: Creation)
- **UTF-8 Encoding**: Fixed special character issues in horrorSeries.js
- **Missing Films**: Added Bly Manor to Mike Flanagan collection
- **Metadata Errors**: Improved fallback for missing TMDB data

### ⚡ Performance
- **50% Faster Loading**: Optimized cache strategy
- **Bandwidth Reduction**: Gzip/Brotli compression enabled
- **Smart Caching**: Separate TTL for metadata (1h) and posters (24h)
- **Timeout Protection**: 5s timeout on TMDB requests
- **Request Batching**: Reduced API calls with intelligent caching

### 🎨 Improvements
- Enhanced manifest with better descriptions
- Improved catalog organization and naming
- Better mobile responsiveness
- Multi-language support preparation
- Code refactoring for better maintainability

---

## [11.0.0] - 2025-01-XX

### Initial Release
- Core functionality with 12 catalogs
- TMDB integration
- Basic caching
- Manifest configuration

---

## Roadmap

### 🔮 Planned for v13.0
- [ ] User preferences (hide catalogs, custom sorting)
- [ ] Search functionality across all catalogs
- [ ] Ratings integration (IMDB, Rotten Tomatoes)
- [ ] "Similar Films" recommendations
- [ ] Custom themes (dark mode, blood mode)
- [ ] Multi-language catalog names
- [ ] Parental controls / content warnings
- [ ] Offline catalog caching

### 🎯 Future Ideas
- [ ] User watchlist sync
- [ ] Seasonal collections (Halloween specials, Christmas horror)
- [ ] Director-focused catalogs (John Carpenter, Wes Craven, etc.)
- [ ] Decade-specific catalogs (80s slashers, 2010s elevated horror)
- [ ] Subgenre deep dives (Folk Horror, Cosmic Horror, Body Horror)
- [ ] International horror (French Extremity, Italian Giallo)
- [ ] Cult classics & B-movies collection
- [ ] Horror comedies catalog
