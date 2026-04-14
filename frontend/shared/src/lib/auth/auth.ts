import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private keycloak!: Keycloak;
  private appBaseUrl!: string;

  async init(config: {
    url: string;
    realm: string;
    clientId: string;
    pkce?: boolean;
    appBaseUrl: string;
  }): Promise<boolean> {
    this.appBaseUrl = config.appBaseUrl;

    this.keycloak = new Keycloak({
      url: config.url,
      realm: config.realm,
      clientId: config.clientId,
    });

    const initOptions: any = {
      checkLoginIframe: false,
      pkceMethod: config.pkce ? 'S256' : false,
    };

    return this.keycloak.init(initOptions);
  }

  async login(): Promise<void> {
    await this.keycloak.login({
      redirectUri: `${this.appBaseUrl}/`,
    });
  }

  async logout(): Promise<void> {
    await this.keycloak.logout({
      redirectUri: `${this.appBaseUrl}/`,
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
