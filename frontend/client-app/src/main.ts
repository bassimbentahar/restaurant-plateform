import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAppInitializer, inject } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { Auth } from 'shared';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(() => {
      const auth = inject(Auth);
      return auth.init({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
        pkceMethod: environment.keycloak.pkce ?? false,
      });
    }),
  ],
});
