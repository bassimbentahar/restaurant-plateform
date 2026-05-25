import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAppInitializer, inject } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {Auth, authInterceptor, errorInterceptor, loggingInterceptor} from 'shared';
import { environment } from './environments/environment';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import {LanguageService} from "./app/services/language";

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([
      loggingInterceptor,
      authInterceptor,
      errorInterceptor
    ])),
    provideTranslateService({
      lang: 'fr',
      fallbackLang: 'fr',
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json',
      }),
    }),

    provideAppInitializer(() => {
      const languageService = inject(LanguageService);
      languageService.init();
    }),

    provideAppInitializer(() => {
      const auth = inject(Auth);

      return auth.init({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
        pkce: environment.keycloak.pkce ?? false,
        appBaseUrl: environment.appBaseUrl,
      });
    }),
  ],
});
