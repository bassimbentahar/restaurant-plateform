import {Injectable} from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private keycloak!: Keycloak;

  async init(config: {
    url: string;
    realm: string;
    clientId: string;
  }): Promise<boolean> {
    this.keycloak = new Keycloak(config);

    return this.keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri:
        window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    });
  }

  login(): Promise<void> {
    return this.keycloak.login({
      redirectUri: window.location.origin,
    });
  }

  logout(): Promise<void> {
    return this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getRoles(): string[] {
    return (
      (this.keycloak.tokenParsed?.['realm_access'] as any)?.roles || []
    );
  }
}
