export interface ProductCreatedResponse {
  id: string;
  title?: string;
  slug?: string;
}

export interface ProductCreateRequest {
  title: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  categoryIds: string[];

  variants: ProductVariantCreateRequest[];
  choices: ProductOptionGroupAssignmentRequest[];
  conditions?: ProductConditionRequest[];
}

export interface ProductVariantCreateRequest {
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
}

export interface ProductOptionGroupAssignmentRequest {
  optionGroupId?: string;

  name?: string;
  description?: string;

  requiredOverride?: boolean;
  minSelectOverride?: number;
  maxSelectOverride?: number;
  displayOrder?: number;

  items?: ProductOptionItemRequest[];

  optionItemOverrides?: ProductOptionItemOverrideRequest[];

  rulesByVariant?: Record<string, ProductChoiceVariantRuleRequest>;
}

export interface ProductOptionItemRequest {
  name: string;
  priceDelta: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface ProductOptionItemOverrideRequest {
  optionItemId: string;
  visible: boolean;
}

export interface ProductChoiceVariantRuleRequest {
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  includedSelections?: number;
}

export interface ProductConditionRequest {
  id?: string;
  label: string;
  enabled: boolean;
  type: 'SELECTION_RULE' | 'AVAILABILITY' | 'VISIBILITY' | 'PRICE_RULE' | 'INCLUDED_OPTION';
}
