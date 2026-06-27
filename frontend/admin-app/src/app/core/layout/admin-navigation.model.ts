export type AdminNavigationSection = {
  title?: string;
  items: AdminNavigationItem[];
};

export type AdminNavigationItem = {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: number;
  requiresAuth?: boolean;
};
