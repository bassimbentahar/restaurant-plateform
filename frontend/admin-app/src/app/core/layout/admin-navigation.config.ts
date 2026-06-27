import { AdminNavigationSection } from './admin-navigation.model';

export const ADMIN_NAVIGATION: AdminNavigationSection[] = [
  {
    items: [
      {
        label: 'admin.dashboard',
        icon: 'grid-outline',
        route: '/dashboard',
        exact: true,
        requiresAuth: true,
      },
    ],
  },
  {
    title: 'admin.menuSection',
    items: [
      {
        label: 'admin.products',
        icon: 'restaurant-outline',
        route: '/menu/products',
        requiresAuth: true,
      },
      {
        label: 'admin.categories',
        icon: 'folder-open-outline',
        route: '/menu/categories',
        requiresAuth: true,
      },
      {
        label: 'admin.menuLibrary',
        icon: 'library-outline',
        route: '/library',
        requiresAuth: true,
      }
    ],
  },
  {
    title: 'admin.businessSection',
    items: [
      {
        label: 'admin.orders',
        icon: 'storefront-outline',
        route: '/orders',
        requiresAuth: true,
      },
      {
        label: 'admin.customers',
        icon: 'people-outline',
        route: '/customers',
        requiresAuth: true,
      },
      {
        label: 'admin.analytics',
        icon: 'analytics-outline',
        route: '/analytics',
        requiresAuth: true,
      },
    ],
  },
  {
    title: 'admin.settingsSection',
    items: [
      {
        label: 'admin.settings',
        icon: 'settings-outline',
        route: '/settings',
        requiresAuth: true,
      },
    ],
  },
];
