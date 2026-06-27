export type ProductWizardStepId =
  | 'general'
  | 'pricing'
  | 'formats'
  | 'choices'
  | 'format-configuration'
  | 'rules'
  | 'preview';

export type ProductWizardStep = {
  id: ProductWizardStepId;
  label: string;
  index: number;
};

export type ProductChoiceSource = 'library' | 'custom';
export type FormatChoiceScope = 'common' | 'variant';

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

export type ProductChoiceItemDraft = {
  id: string;
  optionItemId?: string;
  name: string;
  description?: string;
  priceDelta: number;
  isAvailable: boolean;
  displayOrder: number;
};

export type ProductChoiceItemOverrideDraft = {
  visible: boolean;
};

export type ProductChoiceDraft = {
  id: string;
  source: ProductChoiceSource;
  optionGroupId?: string;
  duplicatedFromOptionGroupId?: string;
  name: string;
  description?: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  items: ProductChoiceItemDraft[];
  itemOverrides: Record<string, ProductChoiceItemOverrideDraft>;
  rulesByVariant: Record<string, ProductChoiceVariantRuleDraft>;
};

export type VariantOptionGroupDraft = {
  id: string;
  optionGroupId: string;
  libraryOptionGroupId?: string;
  name: string;
  description?: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  includedSelections: number;
  displayOrder: number;
  items: ProductChoiceItemDraft[];
  itemOverrides: Record<string, ProductChoiceItemOverrideDraft>;
};

export type ProductVariantDraft = {
  id: string;
  name: string;
  sku?: string | null;
  priceAdjustment: number;
  compareAtPrice?: number | null;
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
  optionGroups: VariantOptionGroupDraft[];
};

export type ProductRuleConditionDraft = {
  variantId?: string;
  optionGroupId?: string;
  optionItemId?: string;
  orderType?: ProductRuleOrderType;
  daysOfWeek: ProductRuleDay[];
  timeFrom?: string;
  timeTo?: string;
  selectedOptionItemIds?: string[];
};

export type ProductRuleActionDraft = {
  visible?: boolean;
  available?: boolean;
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  includedSelections?: number;
  priceDeltaOverride?: number;
};

export type ProductRuleDraft = {
  id: string;
  /**
   * ID de la règle d'origine si elle vient de la bibliothèque.
   * Sert à empêcher l'ajout deux fois de la même règle bibliothèque.
   */
  sourceRuleId?: string;
  label: string;
  description?: string;
  enabled: boolean;
  type: ProductRuleType;
  targetType: ProductRuleTargetType;
  targetId?: string;
  condition: ProductRuleConditionDraft;
  action: ProductRuleActionDraft;
  priority: number;
  favorite?: boolean;
  reusable?: boolean;
  customerVisible?: boolean;
  customerTitle?: string;
  customerDescription?: string;
  tags?: string[];
};

export type AddRuleFromLibraryResult =
  | {
  added: true;
}
  | {
  added: false;
  reason: 'SOURCE_ALREADY_ADDED' | 'BUSINESS_RULE_ALREADY_EXISTS';
};

export type ProductRuleCreateDraftInput = {
  type: ProductRuleType;
  label: string;
  description?: string;
  tags?: string[];
};

export type ProductDraft = {
  title: string;
  internalName: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  categoryIds: string[];
  imageUrl: string;
  variants: ProductVariantDraft[];
  choices: ProductChoiceDraft[];
  rules: ProductRuleDraft[];
};

export type ProductValidationError = {
  field: string;
  message: string;
};

export type OptionGroupLibraryItem = {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  usedInProductCount?: number;
  items: ProductChoiceItemDraft[];
};

export type FormatChoiceView = {
  id: string;
  scope: FormatChoiceScope;
  optionGroupId: string;
  libraryOptionGroupId?: string;
  name: string;
  description?: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  includedSelections: number;
  displayOrder: number;
  items: ProductChoiceItemDraft[];
};

export type ProductChoiceVariantRuleDraft = {
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  includedSelections?: number;
  displayOrder?: number;
};

export type ProductChoiceProductConfiguration = {
  required: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
};
