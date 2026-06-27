import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  IonApp,
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonPopover,
  IonRouterOutlet,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  analyticsOutline,
  bookOutline,
  businessOutline,
  flashOutline,
  folderOpenOutline,
  gridOutline,
  languageOutline,
  logOutOutline,
  peopleOutline,
  restaurantOutline,
  settingsOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { filter, firstValueFrom } from 'rxjs';
import { Auth } from 'shared';

import { UserService } from './services/user.service';
import { AppLanguage, LanguageService } from './services/language';
import { ADMIN_NAVIGATION } from './core/layout/admin-navigation.config';
import { AdminNavigationItem, AdminNavigationSection } from './core/layout/admin-navigation.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonMenu,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonAvatar,
    IonText,
    IonRouterOutlet,
    IonPopover,
    TranslatePipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  readonly auth = inject(Auth);
  readonly userService = inject(UserService);

  readonly user$ = this.userService.user$;

  readonly imageUrl = signal('assets/img/profile.jpg');
  readonly currentUrl = signal('/dashboard');

  readonly navigationSections = signal<AdminNavigationSection[]>(ADMIN_NAVIGATION);

  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());

  readonly pageTitle = computed(() => this.resolvePageTitle(this.currentUrl()));

  readonly languages = [
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'de', label: 'Deutsch', short: 'DE' },
  ] as const;

  isLanguagePopoverOpen = false;
  languagePopoverEvent?: Event;

  constructor() {
    this.registerIcons();
    this.listenToRouterChanges();
  }

  async ngOnInit(): Promise<void> {
    if (this.auth.isLoggedIn()) {
      await firstValueFrom(this.userService.loadMe());
    }
  }

  get currentLanguage(): AppLanguage {
    return this.languageService.getCurrentLanguage();
  }

  async navigateTo(item: AdminNavigationItem): Promise<void> {
    if (item.requiresAuth && !this.auth.isLoggedIn()) {
      await this.router.navigateByUrl('/auth');
      return;
    }

    await this.router.navigateByUrl(item.route);
  }

  async goToCreateProduct(): Promise<void> {
    await this.router.navigateByUrl('/menu/products/new');
  }

  async logout(): Promise<void> {
    this.userService.clear();
    await this.auth.logout();
    await this.router.navigateByUrl('/auth');
  }

  openLanguagePopover(event: Event): void {
    this.languagePopoverEvent = event;
    this.isLanguagePopoverOpen = true;
  }

  changeLanguage(language: AppLanguage): void {
    this.languageService.switchLanguage(language);
    this.isLanguagePopoverOpen = false;
  }

  isActive(item: AdminNavigationItem): boolean {
    const url = this.currentUrl();

    if (item.exact) {
      return url === item.route;
    }

    return url.startsWith(item.route);
  }

  trackBySection = (index: number): number => index;

  trackByItem = (_: number, item: AdminNavigationItem): string => item.route;

  private listenToRouterChanges(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  private resolvePageTitle(url: string): string {
    if (url.startsWith('/dashboard')) return 'admin.dashboard';

    if (url.startsWith('/menu/products/new')) return 'admin.productCreate';

    if (url.startsWith('/menu/products') && url.includes('/edit')) {
      return 'admin.productEdit';
    }

    if (url.startsWith('/menu/products')) return 'admin.products';
    if (url.startsWith('/menu/categories')) return 'admin.categories';
    if (url.startsWith('/library')) return 'admin.library';
    if (url.startsWith('/automations')) return 'admin.automations';
    if (url.startsWith('/orders')) return 'admin.orders';
    if (url.startsWith('/customers')) return 'admin.customers';
    if (url.startsWith('/analytics')) return 'admin.analytics';
    if (url.startsWith('/settings')) return 'admin.settings';

    return 'admin.title';
  }

  private registerIcons(): void {
    addIcons({
      addCircleOutline,
      analyticsOutline,
      bookOutline,
      businessOutline,
      flashOutline,
      folderOpenOutline,
      gridOutline,
      languageOutline,
      logOutOutline,
      peopleOutline,
      restaurantOutline,
      settingsOutline,
      storefrontOutline,
    });
  }
}
