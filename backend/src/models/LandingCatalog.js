const mongoose = require('mongoose');

const landingSongSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const landingArtistSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const landingAlbumSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const landingCatalogSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'landing-page' },
    songs: { type: [landingSongSchema], default: [] },
    artists: { type: [landingArtistSchema], default: [] },
    albums: { type: [landingAlbumSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.LandingCatalog || mongoose.model('LandingCatalog', landingCatalogSchema);
