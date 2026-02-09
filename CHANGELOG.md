# 📝 Changelog

All notable changes to Horror Archive will be documented in this file.

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
