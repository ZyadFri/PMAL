module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  mongoURI: process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  keycloak: {
    url: process.env.KEYCLOAK_URL,
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET
  }
};