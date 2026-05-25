import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
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
  IonMenuButton, IonPopover,
  IonRouterOutlet,
  IonText,
  IonTitle,
  IonToolbar,

} from '@ionic/angular/standalone';
import {filter} from 'rxjs/operators';
import {addIcons} from 'ionicons';
import {
  homeOutline,
  restaurantOutline,
  informationCircleOutline,
  cartOutline,
  logInOutline,
  logOutOutline,
  menuOutline, warningOutline,locationOutline
} from 'ionicons/icons';
import {Auth} from 'shared';
import {CartService} from './services/cart.service';
import {firstValueFrom} from "rxjs";
import {UserService} from "./services/user.service";
import {AppLanguage, LanguageService} from "./services/language";
import {TranslatePipe} from "@ngx-translate/core";

type ClientMenuItem = {
  label: string;
  icon: string;
  route?: string;
  requiresAuth?: boolean;
};

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
export class AppComponent {
  private readonly router = inject(Router);
  readonly auth = inject(Auth);
  readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);

  readonly user$ = this.userService.user$
  readonly imageUrl = signal('assets/img/profile.jpg');
  readonly currentUrl = signal('/home');

  readonly cartCount = computed(() => this.cartService.count());

  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());
  private readonly languageService = inject(LanguageService);

  readonly languages = [
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'de', label: 'Deutsch', short: 'DE' },
  ] as const;

  isLanguagePopoverOpen = false;
  languagePopoverEvent?: Event;

  get currentLanguage(): AppLanguage {
    return this.languageService.getCurrentLanguage();
  }

  openLanguagePopover(event: Event): void {
    this.languagePopoverEvent = event;
    this.isLanguagePopoverOpen = true;
  }

  changeLanguage(language: AppLanguage): void {
    this.languageService.switchLanguage(language);
    this.isLanguagePopoverOpen = false;
  }
  readonly pageTitle = computed(() => {
    const url = this.currentUrl();

    if (url.startsWith('/home')) return 'pages.home';
    if (url.startsWith('/product-list')) return 'pages.products';
    if (url.startsWith('/product-details')) return 'pages.productDetails';
    if (url.startsWith('/cart')) return 'pages.cart';
    if (url.startsWith('/checkout')) return 'pages.checkout';
    if (url.startsWith('/category')) return 'pages.category';
    if (url.startsWith('/about-us')) return 'pages.aboutUs';
    if (url.startsWith('/contact')) return 'pages.contact';
    if (url.startsWith('/news')) return 'pages.news';
    if (url.startsWith('/order-tracking')) return 'order.tracking.title';
    if (url.startsWith('/orders')) return 'pages.orders';
    if (url.startsWith('/profile')) return 'pages.profile';

    return 'app.title';
  });

  readonly menuItems = computed<ClientMenuItem[]>(() => [
    {
      label: 'pages.home',
      icon: 'home-outline',
      route: '/home',
    },
    {
      label: 'pages.profile',
      icon: 'person-outline',
      route: '/profile',
      requiresAuth: true,
    },
    {
      label: 'pages.products',
      icon: 'restaurant-outline',
      route: '/product-list',
    },
    {
      label: 'pages.aboutUs',
      icon: 'information-circle-outline',
      route: '/about-us',
    },
    {
      label: 'pages.contact',
      icon: 'information-circle-outline',
      route: '/contact',
    },
    {
      label: 'pages.checkout',
      icon: 'cart-outline',
      route: '/checkout',
      requiresAuth: true,
    },
  ]);

  constructor() {
    addIcons({
      homeOutline,
      restaurantOutline,
      informationCircleOutline,
      cartOutline,
      logInOutline,
      logOutOutline,
      menuOutline,
      warningOutline,
      locationOutline
    });


    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  async ngOnInit(): Promise<void> {
    if (this.auth.isLoggedIn()) {
      await firstValueFrom(this.userService.loadMe());
    }

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  async goToAuth(): Promise<void> {
    this.router.navigate(['/auth']);
  }

  async logout(): Promise<void> {
    this.userService.clear();
    await this.auth.logout();
  }

  async navigateTo(route: string, requiresAuth = false): Promise<void> {
    if (requiresAuth && !this.auth.isLoggedIn()) {
      await this.router.navigateByUrl('/auth');
      return;
    }

    await this.router.navigateByUrl(route);
  }

  async goToCart(): Promise<void> {
    await this.router.navigateByUrl('/cart');
  }

  trackByLabel = (_: number, item: ClientMenuItem): string => item.label;

}
