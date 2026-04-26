import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import {UserProfile} from './user-profile';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private keycloak!: Keycloak;
  private appBaseUrl!: string;
  private _profile: UserProfile | undefined;

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
      onLoad: 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri:
        window.location.origin + '/silent-check-sso.html',
      pkceMethod: config.pkce ? 'S256' : false,
    };
    const authenticated = await this.keycloak.init(initOptions);
    if(authenticated){
      this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
      this._profile.token= this.keycloak?.token
    }
    return authenticated;
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

  get profile(): UserProfile |undefined{
    return this._profile;
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}
