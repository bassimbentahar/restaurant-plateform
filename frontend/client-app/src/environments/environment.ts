export const environment = {
  production: false,
  appBaseUrl: 'http://localhost:4200',
  keycloak: {
    url: 'http://localhost:9090',
    realm: 'res-realm',
    clientId: 'client-app',
    pkce: false,
  },
  apiUrl: 'http://localhost:8080',
};
