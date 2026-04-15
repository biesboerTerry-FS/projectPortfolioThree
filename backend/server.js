require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/', (request, response) => {
  response.send(`Server running on port ${PORT}`);
});

app.get('/api/status', (request, response) => {
  response.json({ 
    status: "Online", 
    message: "Spotify backend ready" 
});
});

const redirectUri= process.env.REDIRECT_URI || 'http://127.0.0.1:3001/callback';

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(error => console.log(error));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

