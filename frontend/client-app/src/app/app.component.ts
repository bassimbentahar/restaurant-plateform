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
  IonMenuButton,
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

  readonly pageTitle = computed(() => {
    const url = this.currentUrl();

    if (url.startsWith('/home')) return 'Home';
    if (url.startsWith('/product-list')) return 'Products';
    if (url.startsWith('/product-details')) return 'Product Details';
    if (url.startsWith('/cart')) return 'My Cart';
    if (url.startsWith('/checkout')) return 'Checkout';
    if (url.startsWith('/category')) return 'Category';
    if (url.startsWith('/about-us')) return 'About Us';
    if (url.startsWith('/contact')) return 'Contact';
    if (url.startsWith('/news')) return 'News';

    return 'Client App';
  });

  readonly menuItems = computed<ClientMenuItem[]>(() => [
    {
      label: 'Home',
      icon: 'home-outline',
      route: '/home',
    },
    {
      label: 'Profile',
      icon: 'person-outline',
      route: '/profile',
      requiresAuth: true
    },
    {
      label: 'Products',
      icon: 'restaurant-outline',
      route: '/product-list',
    },
    {
      label: 'About Us',
      icon: 'information-circle-outline',
      route: '/about-us',
    },
    {
      label: 'Contact',
      icon: 'information-circle-outline',
      route: '/contact',
    },
    {
      label: 'Checkout',
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
