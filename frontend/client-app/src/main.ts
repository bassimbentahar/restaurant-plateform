import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAppInitializer, inject } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { Auth } from 'shared';
import { environment } from './environments/environment';
import { KeycloakPkceMethod } from 'keycloak-js';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(() => {
      const auth = inject(Auth);

      const pkceMethod: KeycloakPkceMethod | false =
        environment.keycloak.pkce ?? false;

      return auth.init({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
        pkceMethod,
      });
    }),
  ],
});
