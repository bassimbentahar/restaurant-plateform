import {Injectable} from '@angular/core';
import Keycloak, {KeycloakPkceMethod} from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private keycloak!: Keycloak;

  async init(config: {
    url: string;
    realm: string;
    clientId: string;
    pkceMethod?: KeycloakPkceMethod | false;
  }): Promise<boolean> {
    console.log('PKCE config =', config.pkceMethod);
    this.keycloak = new Keycloak({
      url: config.url,
      realm: config.realm,
      clientId: config.clientId,
    });

    return this.keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri:
        window.location.origin + '/silent-check-sso.html',
      pkceMethod: config.pkceMethod
    });
  }

  async login(): Promise<void> {
    await this.keycloak.login({
      redirectUri: window.location.origin,
    });
  }

  async logout(): Promise<void> {
    await this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  isLoggedIn(): boolean {
    return !!this.keycloak?.authenticated;
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  getUsername(): string | undefined {
    return this.keycloak?.tokenParsed?.['preferred_username'] as string | undefined;
  }

  getRoles(): string[] {
    return ((this.keycloak?.tokenParsed?.['realm_access'] as { roles?: string[] })?.roles ?? []);
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}
