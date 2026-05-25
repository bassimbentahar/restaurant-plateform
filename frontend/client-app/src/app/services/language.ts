import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'fr' | 'en' | 'de';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);

  private readonly supportedLanguages: AppLanguage[] = ['fr', 'en', 'de'];
  private readonly storageKey = 'app_language';

  init(): void {
    const savedLanguage = localStorage.getItem(this.storageKey) as AppLanguage | null;

    const browserLang = this.translate.getBrowserLang(); // ex: "de"
    const browserCulture = this.translate.getBrowserCultureLang(); // ex: "de-CH"

    let detectedLang = browserLang;

    if (!this.isSupported(detectedLang)) {
      if (browserCulture?.startsWith('de')) detectedLang = 'de';
      else if (browserCulture?.startsWith('fr')) detectedLang = 'fr';
      else if (browserCulture?.startsWith('en')) detectedLang = 'en';
    }

    const language =
      this.isSupported(savedLanguage) ? savedLanguage :
        this.isSupported(detectedLang) ? detectedLang :
          'fr';

    this.translate.use(language);
  }

  switchLanguage(language: AppLanguage): void {
    this.translate.use(language);
    localStorage.setItem(this.storageKey, language);
  }

  getCurrentLanguage(): AppLanguage {
    return (this.translate.currentLang || 'fr') as AppLanguage;
  }

  private isSupported(language?: string | null): language is AppLanguage {
    return !!language && this.supportedLanguages.includes(language as AppLanguage);
  }
}
