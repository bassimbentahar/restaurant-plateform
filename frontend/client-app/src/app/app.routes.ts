import {Routes} from '@angular/router';
import {authGuard} from 'shared';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth').then(m => m.AuthPage)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.Profile)
  },
  {
    path: 'product-list',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'product-list/:id',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'product-details/:id',
    loadComponent: () =>
      import('./pages/product-details/product-details').then((m) => m.ProductDetails),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
