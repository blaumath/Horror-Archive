# 🎬 Horror Archive - Ultimate Horror Collection for Stremio

<div align="center">

![Version](https://img.shields.io/badge/version-13.0.0-red)
![Catalogs](https://img.shields.io/badge/catalogs-25+-darkred)
![Films](https://img.shields.io/badge/films-700+-crimson)
![Status](https://img.shields.io/badge/status-production-green)

**The most complete horror collection addon for Stremio**

[🚀 Install Now](#installation) • [📚 Catalogs](#catalogs) • [⚙️ Features](#features) • [🐛 Report Bug](https://github.com/blaumath/Horror-Archive/issues)

</div>

---

## 📦 Installation

### 🛠️ Option 1: Custom Configuration (Recommended)
Access the configuration page to customize your experience:  
🔗 **[Configure Horror Archive](https://horror-archive.vercel.app)**

### ⚡ Option 2: Direct Installation
Copy and paste the manifest link directly into Stremio search bar:
```
https://horror-archive.vercel.app/manifest.json
```

---

## 📚 Catalogs

### 🔪 Classic Slasher Franchises
- 🎃 **Halloween Saga** (13 films)
- 🔪 **Friday the 13th** (12 films)
- 💀 **Nightmare on Elm Street** (9 films)
- 📞 **Scream Saga** (7 films)
- 🔴 **Chucky Saga** (8 films)
- 🧩 **Saw Legacy** (10 films)
- 🪚 **Texas Chainsaw Massacre** (9 films)

### 👻 Supernatural Universes
- 👻 **The Conjuring Universe** (9 films) - Release & Timeline order
- 🚪 **Insidious Universe** (5 films)
- 📹 **Paranormal Activity** (7 films)

### 🎬 Modern Horror Sagas
- 🎨 **A24 & Indie Horror** - Hereditary, Midsommar, The Witch, Talk to Me, etc.
- 🎬 **Modern Horror Sagas** - Terrifier trilogy, X trilogy, The Purge series
- 💀 **Final Destination** (6 films)
- 🧟 **Resident Evil** (7 films)
- 📖 **Evil Dead Saga** (5 films)
- 📦 **Hellraiser** (11 films)

### 🎭 By Genre & Style
- 👑 **Horror Classics (60s-00s)** - 70+ essential films from Psycho to The Descent
- 🧠 **Psychological Horror** - Mind-bending terror from Se7en to Hereditary
- 📼 **Found Footage** - Blair Witch, REC, V/H/S, Paranormal Activity, etc.
- 🧟‍♂️ **Zombie Films** - From Romero classics to Train to Busan
- 🎌 **Asian Horror** - J-Horror (Ringu, Ju-on) & K-Horror (The Wailing, Train to Busan)

### 📚 Special Collections
- 📚 **Stephen King Collection** - IT, The Shining, Pet Sematary, Carrie, etc.
- 📺 **Horror TV Series** - From, Mike Flanagan Universe, American Horror Story, etc.

---

## 🚀 Features

### ✨ Core Features
- ✅ **700+ Horror Films & Series** carefully curated
- ✅ **25+ Specialized Catalogs** organized by franchise, genre, and style
- ✅ **Chronological & Timeline Options** (e.g., Conjuring Universe)
- ✅ **High-Quality Metadata** from TMDB (Portuguese & English)
- ✅ **Verified IMDb IDs** - guaranteed correct streams
- ✅ **Smart Caching** - blazing fast performance
- ✅ **Gzip Compression** - optimized bandwidth usage
- ✅ **Works with Torrentio** - compatible with all major stream providers

### 🎯 New in v13.0
- 🆕 Added missing 2025 releases (28 Years Later, Final Destination: Bloodlines, Conjuring 4, Scream 7)
- 🆕 Added M3GAN franchise (M3GAN, M3GAN 2.0)
- 🐛 Fixed V/H/S/85 IMDb ID (was using Terrifier 3's ID)
- ⚡ Performance improvements - removed unused dependencies (axios, p-limit)
- 🛡️ Better error handling on meta routes
- 🎨 Updated to 700+ films & series
- 🔧 Fixed /configure route for better Vercel compatibility

---

## 🛠️ Technical Details

### Performance Optimizations
- **Smart Caching**: 24h cache for posters, 1h for metadata
- **Lazy Loading**: Metadata fetched only when needed
- **Compression**: Gzip/Brotli enabled for all responses
- **CDN**: Static assets served via GitHub CDN
- **Error Handling**: Graceful fallbacks for missing data

### API Integration
- **TMDB API**: Rich metadata, cast, crew, ratings
- **Metahub**: High-quality poster fallbacks
- **Cinemeta**: Stremio official metadata integration

### Tech Stack
- **Node.js 20.x**
- **Express.js** - Lightning-fast server
- **Axios** - Reliable HTTP client
- **NodeCache** - In-memory caching
- **Compression** - Response compression

---

## 📊 Statistics

- **Total Films**: 700+
- **Total Series**: 30+
- **Franchises**: 20+
- **Decades Covered**: 1960s - 2025
- **Languages**: Portuguese, English
- **Update Frequency**: Weekly

---

## 🤝 Contributing

Found a bug or want to suggest a film?

1. Open an [Issue](https://github.com/blaumath/Horror-Archive/issues)
2. Submit a [Pull Request](https://github.com/blaumath/Horror-Archive/pulls)
3. Star ⭐ this repository if you like it!

---

## 📜 Credits

This addon was built with ❤️ by horror fans, for horror fans.

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This addon only provides catalog organization and metadata. All streaming content is provided by third-party services like Torrentio, and we have no control over availability or legality of streams.

---

<div align="center">

**Made with 🩸 for horror enthusiasts**

[⬆ Back to top](#-horror-archive---ultimate-horror-collection-for-stremio)

</div>
