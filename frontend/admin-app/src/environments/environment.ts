export const environment = {
  production: false,
  appBaseUrl: 'http://localhost:4201',

  keycloak: {
    url: 'http://localhost:9090',
    realm: 'res-realm',
    clientId: 'admin-app',
    pkce: true,
  },

  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080',

  imageBaseUrl: 'http://localhost:8080/media',

  googleMapsApiKey: 'AIzaSyBVrVkRJhzo5QQOJuM8lxetZWYmV1oUIOk',
};
