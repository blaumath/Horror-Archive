#!/usr/bin/env node

require('dotenv').config();
const app = require('./addon');

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`🎬 Horror Archive running at http://localhost:${PORT}`);
    console.log(`📋 Manifest: http://localhost:${PORT}/manifest.json`);
    console.log(`⚙️  Configure: http://localhost:${PORT}/configure`);
});
