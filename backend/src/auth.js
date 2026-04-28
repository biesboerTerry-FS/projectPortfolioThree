const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function resolveAuthFromToken(token) {
  if (!token) {
    return { authenticated: false, reason: 'missing-token' };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return { authenticated: false, reason: 'invalid-user' };
    }

    const activeSession = user.sessions.find(
      (session) => session.jti === payload.jti && session.expiresAt > new Date()
    );

    if (!activeSession) {
      return { authenticated: false, reason: 'session-expired-or-revoked' };
    }

    return {
      authenticated: true,
      payload,
      user,
      activeSession,
      reason: null,
    };
  } catch (error) {
    return { authenticated: false, reason: 'invalid-token' };
  }
}

function createSessionToken(user, provider) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      sub: user._id.toString(),
      provider,
      jti,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  const payload = jwt.decode(token);
  return { token, jti, exp: payload.exp };
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email || user.spotify?.email || null,
    displayName: user.displayName,
    avatarUrl: user.spotify?.image || null,
    lastLoginProvider: user.lastLoginProvider,
    spotifyConnected: Boolean(user.spotify?.refreshToken),
  };
}

async function authenticateJwt(request, response, next) {
  try {
    const authHeader = request.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return response.status(401).json({ error: 'Missing bearer token' });
    }

    const result = await resolveAuthFromToken(token);
    if (!result.authenticated) {
      return response.status(401).json({ error: 'Session expired or revoked' });
    }

    request.auth = { payload: result.payload, user: result.user };
    return next();
  } catch (error) {
    return response.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = {
  createSessionToken,
  sanitizeUser,
  authenticateJwt,
  resolveAuthFromToken,
};
