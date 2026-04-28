require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { API_PREFIX } = require('./config/constants');
const authRoutes = require('./routes/authRoutes');
const spotifyRoutes = require('./routes/spotifyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
  const port = process.env.PORT || 3001;
  response.send(`Server running on port ${port}`);
});

app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, spotifyRoutes);

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
