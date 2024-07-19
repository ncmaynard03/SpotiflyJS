const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to send environment variables to the client
app.get('/env', (req, res) => {
    res.json({
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
        SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
