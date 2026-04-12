export type CurrencyCode = 'CHF' | 'EUR' | 'USD' | string;

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductReview {
  rating: number;
  comment?: string;
  authorName?: string;
  createdAt?: string;
}

export interface ProductTag {
  id: string;
  name: string;
}

export interface ProductVariant {
  id: string;
  code?: string;
  name: string; // Small, Medium, Large
  description?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  isDefault?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
}

export type OptionGroupDisplayType = 'radio' | 'checkbox' | 'select' | 'buttons';

export interface ProductOption {
  id: string;
  code?: string;
  name: string;
  description?: string;
  priceDelta: number;
  compareAtPriceDelta?: number | null;
  isDefault?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;

  // Si l'option n'est valable que pour certaines variantes
  allowedVariantIds?: string[];

  // Si tu veux plus tard gérer le stock
  stockQuantity?: number | null;
}

export interface ProductOptionGroup {
  id: string;
  code?: string;
  name: string; // Ex: "Sauce", "Suppléments", "Cuisson"
  description?: string;

  displayType: OptionGroupDisplayType;

  required: boolean;
  multiple: boolean;

  minSelect: number;
  maxSelect: number;

  isAvailable?: boolean;
  sortOrder?: number;

  options: ProductOption[];
}

export interface ProductAvailability {
  isAvailable: boolean;
  availableFrom?: string;
  availableTo?: string;
  daysOfWeek?: number[]; // 0 dimanche, 1 lundi...
}

export interface ProductNutritionInfo {
  calories?: number | null;
  allergens?: string[];
  ingredients?: string[];
}

export interface Product {
  id: string;
  sku?: string;
  slug?: string;

  title: string;
  shortDescription?: string;
  description?: string;

  isAvailable: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;

  category?: ProductCategoryRef;
  categories?: ProductCategoryRef[];

  thumb?: string;
  images?: ProductImage[];

  // Prix simple si le produit n’a pas de variantes
  basePrice?: number | null;

  // Variantes type Small / Medium / Large
  variants?: ProductVariant[];

  // Groupes d'options type sauce, suppléments, cuisson...
  optionGroups?: ProductOptionGroup[];

  reviews?: ProductReview[];

  tags?: ProductTag[];
  preparationTimeMinutes?: number | null;

  nutrition?: ProductNutritionInfo;
  availability?: ProductAvailability;

  createdAt?: string;
  updatedAt?: string;
}
