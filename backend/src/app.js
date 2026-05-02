require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { API_PREFIX } = require('./config/constants');
const authRoutes = require('./routes/authRoutes');
const spotifyRoutes = require('./routes/spotifyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, spotifyRoutes);

const distPath = path.join(__dirname, '../../frontend/dist');
const indexHtml = path.join(distPath, 'index.html');

if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith(API_PREFIX)) return next();
    res.sendFile(indexHtml);
  });
} else {
  app.get('/', (request, response) => {
    const port = process.env.PORT || 3001;
    response.send(`Server running on port ${port}`);
  });
}

async function connectToDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  return mongoose.connect(process.env.MONGO_URI);
}

module.exports = {
  app,
  connectToDatabase,
};
