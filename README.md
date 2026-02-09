# 🎬 Horror Archive - Ultimate Horror Collection for Stremio

<div align="center">

![Version](https://img.shields.io/badge/version-13.0.0-red)
![Catalogs](https://img.shields.io/badge/catalogs-24+-darkred)
![Films](https://img.shields.io/badge/films-700+-crimson)
![Status](https://img.shields.io/badge/status-production-green)

**The most complete horror collection addon for Stremio**

[🚀 Install Now](#installation) • [📚 Catalogs](#catalogs) • [⚙️ Features](#features) • [🐛 Report Bug](https://github.com/blaumath/Horror-Archive/issues)

</div>

---

## 📦 Installation

> 🇧🇷 **Usuários brasileiros:** Veja o [Guia de Configuração do Vercel](./VERCEL_SETUP.md) para configurar a chave de API do TMDB.

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
- 📞 **Scream Saga** (6 films)
- 🔴 **Chucky Saga** (9 films)
- 🧩 **Saw Legacy** (10 films)
- 🪚 **Texas Chainsaw Massacre** (9 films)

### 👻 Supernatural Universes
- 👻 **The Conjuring Universe** (8 films) - Release & Timeline order
- 🚪 **Insidious Universe** (5 films)
- 📹 **Paranormal Activity** (7 films)

### 🎬 Modern Horror Sagas
- 🎨 **A24 & Indie Horror** (16 films) - Hereditary, Midsommar, The Witch, Talk to Me, etc.
- 🎬 **Modern Horror Sagas** - Terrifier trilogy, X trilogy, The Purge series
- 💀 **Final Destination** (5 films)
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
- 📚 **Stephen King Collection** (69 items) - IT, The Shining, Pet Sematary, Carrie, etc.
- 📺 **Horror TV Series** (85 series) - From, Mike Flanagan Universe, American Horror Story, etc.

---

## 🚀 Features

### ✨ Core Features
- ✅ **700+ Horror Films & Series** carefully curated
- ✅ **24 Specialized Catalogs** organized by franchise, genre, and style
- ✅ **Chronological & Timeline Options** (e.g., Conjuring Universe)
- ✅ **High-Quality Metadata** from TMDB (Portuguese & English)
- ✅ **Verified IMDb IDs** - guaranteed correct streams
- ✅ **Smart Caching** - blazing fast performance
- ✅ **Gzip Compression** - optimized bandwidth usage
- ✅ **Works with Torrentio** - compatible with all major stream providers

### 🎯 New in v13.0
- 🆕 Updated catalog counts (700+ total items)
- 🆕 Enhanced Chucky Saga (9 films)
- 🆕 Expanded A24 collection (16 films)
- 🆕 Massive Stephen King collection (69 items)
- 🆕 Expanded Horror Series catalog (85 series)
- 🐛 Fixed Vercel deployment configuration
- 📝 Improved documentation and website
- ⚡ Better configuration page experience

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

### Optional Configuration

#### TMDB API Key (Optional)
The addon works perfectly without a TMDB API key, using fallback metadata sources. However, if you want enhanced metadata (cast, crew, directors, ratings), you can add a TMDB API key:

**For local development:**
1. Copy `.env.example` to `.env`
2. Add your TMDB API key: `TMDB_API_Key=your_api_key_here`

**For Vercel deployment:**
📖 **[Complete Vercel Setup Guide (Portuguese)](./VERCEL_SETUP.md)** - Guia completo em português

Quick steps:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `TMDB_API_Key` with your API key value
4. Redeploy the project

*Note: Without the API key, the addon will still function normally using alternative metadata sources.*

---

## 📊 Statistics

- **Total Films**: 700+
- **Total Series**: 85+
- **Franchises**: 20+
- **Decades Covered**: 1960s - 2024
- **Languages**: Portuguese, English
- **Update Frequency**: Weekly

---

## 🤝 Contributing

Found a bug or want to suggest a film?

1. Open an [Issue](https://github.com/blaumath/Horror-Archive/issues)
2. Submit a [Pull Request](https://github.com/blaumath/Horror-Archive/pulls)
3. Star ⭐ this repository if you like it!

---

---

## 🎯 Why Horror Archive?

**Horror Archive** stands out as the most comprehensive horror collection for Stremio with:

- **Unmatched Catalog Diversity**: 24 specialized catalogs covering classic slashers, supernatural universes, modern indie horror, and genre-specific collections
- **Curated Quality**: Every film carefully selected and verified with correct IMDb IDs
- **Smart Organization**: Multiple viewing options (chronological, timeline order, release order)
- **Rich Metadata**: Enhanced information from TMDB including directors, cast, ratings, and descriptions
- **Performance Optimized**: Smart caching and compression for lightning-fast browsing
- **Always Updated**: Regular updates with new releases and classic additions
- **Community Driven**: Open source and welcoming contributions from horror fans

Whether you're a casual horror viewer or a hardcore enthusiast, Horror Archive provides the perfect gateway to discover and organize your horror watching experience.

---

## 📜 License & Credits

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
