import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private keycloak!: Keycloak;

  async init(): Promise<boolean> {
    this.keycloak = new Keycloak({
      url: 'http://localhost:9090',
      realm: 'res-realm',
      clientId: 'client-app',
    });

    return await this.keycloak.init({
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

  getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.['preferred_username'] as string;
  }

  getRoles(): string[] {
    return (
      (this.keycloak.tokenParsed?.['realm_access'] as any)?.roles || []
    );
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}
