import { Routes } from '@angular/router';
import { authGuard } from 'shared';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
        import('./pages/auth/auth').then((m) => m.AuthPage),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
        //import('./pages/admin-dashboard/admin-dashboard.page').then(
        import('./pages/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard
        ),
  },

  {
    path: 'menu/products',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/admin-products/admin-products').then(
            (m) => m.AdminProducts
        ),
  },

  {
    path: 'menu/products/new',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/product-wizard/product-wizard').then(
            (m) => m.ProductWizard
        ),
  },

  {
    path: 'menu/products/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/product-wizard/product-wizard').then(
            (m) => m.ProductWizard
        ),
  },

  {
    path: 'menu/categories',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/admin-categories/admin-categories').then(
            (m) => m.AdminCategories
        ),
  },

  {
    path: 'library',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/menu-library/menu-library-page.component').then(
            (m) => m.MenuLibraryPageComponent
        ),
  },

  {
    path: 'automations',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/automations/automations').then(
            (m) => m.Automations
        ),
  },

  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/admin-orders/admin-orders').then(
            (m) => m.AdminOrders
        ),
  },

  {
    path: 'customers',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/admin-customers/admin-customers').then(
            (m) => m.AdminCustomers
        ),
  },

  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/admin-analytics/admin-analytics').then(
            (m) => m.AdminAnalytics
        ),
  },

  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./pages/admin-settings/admin-settings').then(
            (m) => m.AdminSettings
        ),
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
