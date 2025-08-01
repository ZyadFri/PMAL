import Keycloak from 'keycloak-js';

// Create a single instance
const keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'PMAL-realm',
  clientId: 'PMAL-client'
});

export default keycloak;