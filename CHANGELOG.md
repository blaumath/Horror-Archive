# 📝 Changelog

All notable changes to Horror Archive will be documented in this file.

## [13.0.0] - 2025-02-09

### 🆕 Added
- **Updated Catalog Counts**:
  - Chucky Saga: 8 → 9 films
  - A24 & Indie Horror: 12 → 16 films
  - Stephen King Collection: 24 → 69 items
  - Horror TV Series: 30 → 85 series
  - Total content: 500+ → 700+ items

- **Documentation Enhancements**:
  - Added "Why Horror Archive?" section explaining key differentials
  - Better organized catalog descriptions with accurate counts
  - Improved statistics and feature highlights
  - Enhanced README structure and readability

### 🐛 Fixed
- **Critical**: Verified Vercel deployment configuration uses modern `rewrites` instead of deprecated `builds`/`routes`
- **Critical**: Removed non-existent secret reference from vercel.json that was causing deployment errors
- **Critical**: Added detailed troubleshooting guide for Vercel environment variable configuration errors
- **Conjuring Universe**: Corrected film count from 9 to 8 films

### 🎨 Improvements
- Updated website configuration page to v13.0.0
- Updated all version badges and documentation
- Better catalog count accuracy across all documentation
- Improved user experience on configuration page
- Removed outdated credits section per user request

### 📝 Documentation
- Comprehensive README overhaul with better organization
- Updated technical details and API integration info
- Enhanced installation instructions
- Better feature descriptions and statistics
- Added optional TMDB API key configuration instructions
- **New**: Created `.env.example` for local development reference
- **New**: Added complete Vercel setup guide in Portuguese (`VERCEL_SETUP.md`)
- **New**: Added Portuguese reference in README for Brazilian users
- **New**: Created quick troubleshooting guide (`ERRO_VERCEL.md`) for common deployment errors
- **Enhanced**: Detailed instructions on how to correctly configure environment variables in Vercel
- **Enhanced**: Clear warnings about Secret vs Environment Variable confusion

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
