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
  name: string;
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
  description?: string | null;
  priceDelta: number;
  compareAtPriceDelta?: number | null;
  isDefault?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;

  allowedVariantIds?: string[];
  stockQuantity?: number | null;
}

export interface ProductOptionGroup {
  id: string;
  code?: string;
  name: string;
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

export interface Product {
  id: string;
  sku?: string;
  slug?: string;

  title: string;
  shortDescription?: string | null;
  description?: string | null;

  isAvailable: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;

  category?: ProductCategoryRef;
  categories?: ProductCategoryRef[];

  thumb?: string | null;
  images?: ProductImage[];

  basePrice?: number | null;

  variants?: ProductVariant[];
  optionGroups?: ProductOptionGroup[];

  reviews?: ProductReview[];
  tags?: ProductTag[];

  preparationTimeMinutes?: number | null;

  // Nutrition à plat, alignée avec l'API
  calories?: number | null;
  ingredientsText?: string | null;
  allergensText?: string | null;

  // Disponibilité à plat, alignée avec l'API
  availableFrom?: string;
  availableTo?: string;

  createdAt?: string;
  updatedAt?: string;
}
