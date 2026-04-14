export const environment = {
  production: true,
  appBaseUrl: 'https://portalcoffee.ch',
  keycloak: {
    url: 'https://auth.portalcoffee.ch',
    realm: 'res-realm',
    clientId: 'client-app',
    pkce: true,
  },
};
