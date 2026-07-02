export const environment = {
  production: false,
  appBaseUrl: 'https://admin-dev.portalcoffee.ch',

  keycloak: {
    url: 'https://auth.portalcoffee.ch',
    realm: 'res-realm',
    clientId: 'admin-app',
    pkce: true,
  },

  apiUrl: 'https://api-dev.portalcoffee.ch',
  wsUrl: 'wss://api-dev.portalcoffee.ch',

  imageBaseUrl: 'https://api-dev.portalcoffee.ch',

  googleMapsApiKey: 'AIzaSyBVrVkRJhzo5QQOJuM8lxetZWYmV1oUIOk',
};
