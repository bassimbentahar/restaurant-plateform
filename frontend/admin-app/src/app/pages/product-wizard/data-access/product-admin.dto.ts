export type ProductRuleType =
  | 'SELECTION_RULE'
  | 'AVAILABILITY'
  | 'VISIBILITY'
  | 'PRICE_RULE'
  | 'INCLUDED_OPTION';

export type ProductRuleTargetType =
  | 'RESTAURANT'
  | 'PRODUCT'
  | 'VARIANT'
  | 'OPTION_GROUP'
  | 'OPTION_ITEM';

export type ProductRuleOrderType = 'DELIVERY' | 'PICKUP';

export type ProductRuleDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface ProductCreateRequest {
  sku: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  thumb?: string;

  basePrice: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isArchived: boolean;

  preparationTimeMinutes?: number;
  availableFrom?: string;
  availableTo?: string;

  calories?: number;
  ingredientsText?: string;
  allergensText?: string;

  categoryIds: string[];
  images: ProductImageRequest[];

  optionGroups: ProductOptionGroupAssignmentRequest[];
  variants: ProductVariantRequest[];

  rules: ProductRuleRequest[];
}

export interface ProductCategoryCreateRequest {
  name: string;
}

/**
 * Response utilisée par la page /menu/products.
 *
 * Elle correspond à ton backend ProductMapper.toProductSummaryResponse(...):
 * id, slug, title, shortDescription, thumb, basePrice, isAvailable,
 * isFeatured, categories.
 *
 * isArchived est optionnel parce que ton ProductMapper summary actuel ne
 * semble pas encore le retourner. Si tu l'ajoutes plus tard côté backend,
 * la page Produits le prendra automatiquement en compte.
 */
export interface ProductSummaryResponse {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  thumb?: string;
  basePrice: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isArchived?: boolean;
  categories: ProductCategoryResponse[];
}

export interface ProductResponse {
  id: string;
  sku: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  thumb?: string;
  basePrice: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  preparationTimeMinutes?: number;
  availableFrom?: string;
  availableTo?: string;
  calories?: number;
  ingredientsText?: string;
  allergensText?: string;
  categories?: ProductCategoryResponse[];
  images?: ProductImageResponse[];
  variants?: ProductVariantResponse[];
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface ProductVariantResponse {
  id: string;
  name: string;
  sku?: string;
  priceAdjustment: number;
  compareAtPrice?: number | null;
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
}

export interface ProductEditResponse {
  id: string;
  sku: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  thumb?: string | null;

  basePrice: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isArchived: boolean;

  preparationTimeMinutes?: number | null;
  availableFrom?: string | null;
  availableTo?: string | null;

  calories?: number | null;
  ingredientsText?: string | null;
  allergensText?: string | null;

  categories: ProductCategoryResponse[];
  images: ProductImageResponse[];

  optionGroups: ProductEditOptionGroupResponse[];
  variants: ProductEditVariantResponse[];
  rules: ProductEditRuleResponse[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductEditOptionGroupResponse {
  id: string;
  clientId: string;
  optionGroupId: string;
  name: string;
  description?: string | null;
  requiredOverride?: boolean | null;
  minSelectOverride?: number | null;
  maxSelectOverride?: number | null;
  displayOrder?: number | null;
  items: ProductEditOptionItemResponse[];
  optionItemOverrides: ProductEditOptionItemOverrideResponse[];
}

export interface ProductEditOptionItemResponse {
  id: string;
  optionItemId: string;
  name: string;
  description?: string | null;
  priceDelta: number;
  isAvailable: boolean;
  displayOrder?: number | null;
}

export interface ProductEditOptionItemOverrideResponse {
  optionItemId: string;
  visible: boolean;
}

export interface ProductEditRuleResponse {
  id: string;
  sourceRuleId?: string | null;

  name?: string | null;
  description?: string | null;

  enabled?: boolean | null;
  favorite?: boolean | null;
  reusable?: boolean | null;

  customerVisible?: boolean | null;
  customerTitle?: string | null;
  customerDescription?: string | null;

  tags?: string[];

  type?: string | null;
  targetType?: string | null;

  variantClientId?: string | null;
  optionGroupClientId?: string | null;
  optionItemId?: string | null;

  condition?: ProductRuleConditionResponse | null;
  action?: ProductRuleActionResponse | null;

  priority?: number | null;
}

export interface ProductRuleConditionResponse {
  productId?: string | null;
  variantId?: string | null;
  optionGroupId?: string | null;
  optionItemId?: string | null;
  selectedOptionItemIds?: string[] | null;

  orderType?: string | null;
  daysOfWeek?: string[] | null;
  timeFrom?: string | null;
  timeTo?: string | null;
}

export interface ProductRuleActionResponse {
  visible?: boolean | null;
  available?: boolean | null;
  required?: boolean | null;

  minSelections?: number | null;
  maxSelections?: number | null;
  includedSelections?: number | null;

  priceDeltaOverride?: number | null;
}

export interface ProductEditVariantResponse {
  id: string;
  clientId: string;
  name: string;
  sku?: string | null;
  priceAdjustment: number;
  compareAtPrice?: number | null;
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
  optionGroups: ProductEditVariantOptionGroupResponse[];
}

export interface ProductEditVariantOptionGroupResponse {
  id: string;
  optionGroupId: string;
  optionGroupClientId: string;

  requiredOverride?: boolean | null;
  minSelectOverride?: number | null;
  maxSelectOverride?: number | null;
  includedSelectionsOverride?: number | null;

  displayOrder?: number | null;
}

export interface ProductImageResponse {
  id?: string;
  url: string;
  altText?: string;
  displayOrder: number;
  primary: boolean;
}

export interface ProductImageRequest {
  url: string;
  altText?: string;
  displayOrder: number;
  primary: boolean;
}

export interface ProductOptionGroupAssignmentRequest {
  clientId: string;
  optionGroupId?: string;
  name?: string;
  description?: string;
  requiredOverride?: boolean;
  minSelectOverride?: number;
  maxSelectOverride?: number;
  displayOrder?: number;
  items?: ProductOptionItemRequest[];
  optionItemOverrides?: ProductOptionItemOverrideRequest[];
}

export interface ProductOptionItemRequest {
  name: string;
  description?: string;
  priceDelta: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface ProductOptionItemOverrideRequest {
  optionItemId: string;
  visible: boolean;
}

export interface ProductVariantRequest {
  clientId: string;
  name: string;
  sku?: string;
  priceAdjustment: number;
  compareAtPrice?: number | null;
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
  optionGroups: VariantOptionGroupAssignmentRequest[];
}

export interface VariantOptionGroupAssignmentRequest {
  optionGroupId?: string;
  optionGroupClientId?: string;
  requiredOverride?: boolean;
  minSelectOverride?: number;
  maxSelectOverride?: number;
  includedSelectionsOverride?: number;
  displayOrder?: number;
}

export interface ProductRuleRequest {
  sourceRuleId?: string;
  name: string;
  description?: string;
  enabled: boolean;
  favorite: boolean;
  reusable: boolean;
  customerVisible: boolean;
  customerTitle?: string;
  customerDescription?: string;
  tags?: string[];

  type: ProductRuleType;
  targetType: ProductRuleTargetType;
  variantClientId?: string;
  optionGroupClientId?: string;
  optionItemId?: string;
  condition: ProductRuleConditionRequest;
  action: ProductRuleActionRequest;
  priority: number;
}

export interface ProductRuleConditionRequest {
  productId?: string;
  variantId?: string;
  optionGroupId?: string;
  optionItemId?: string;
  orderType?: ProductRuleOrderType | string;
  daysOfWeek?: ProductRuleDay[] | string[];
  timeFrom?: string;
  timeTo?: string;
  selectedOptionItemIds?: string[];
}

export interface ProductRuleActionRequest {
  visible?: boolean;
  available?: boolean;
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  includedSelections?: number;
  priceDeltaOverride?: number;
}

export interface ProductCreatedResponse {
  id: string;
}

export interface ProductCategoryResponse {
  id: string;
  name: string;
  slug?: string;
}
