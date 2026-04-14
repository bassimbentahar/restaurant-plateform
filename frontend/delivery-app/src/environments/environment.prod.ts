export const environment = {
  production: true,
  keycloak: {
    url: 'https://ton-domaine-keycloak',
    realm: 'res-realm',
    clientId: 'client-app',
    pkce: 'S256' as const,
  },
};
