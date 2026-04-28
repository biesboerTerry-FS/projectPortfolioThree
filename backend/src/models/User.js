const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true },
    provider: { type: String, enum: ['spotify'], required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },
    email: String,
    displayName: String,
    image: String,
    refreshToken: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, index: true, sparse: true },
    displayName: String,
    spotify: providerProfileSchema,
    sessions: [sessionSchema],
    lastLoginProvider: { type: String, enum: ['spotify'] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
