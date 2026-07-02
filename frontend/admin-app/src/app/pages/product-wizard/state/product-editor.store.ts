import {Injectable, computed, signal} from '@angular/core';

import {
  ProductCategoryResponse,
  ProductEditResponse,
  ProductEditVariantResponse, ProductStatus,
} from '../data-access/product-admin.dto';

import {
  FormatChoiceView,
  OptionGroupLibraryItem,
  ProductChoiceDraft,
  ProductChoiceItemDraft,
  ProductRuleDraft,
  ProductDraft,
  ProductRuleActionDraft,
  ProductRuleConditionDraft,
  ProductRuleType,
  ProductValidationError,
  ProductVariantDraft,
  ProductWizardStep,
  ProductWizardStepId,
  VariantOptionGroupDraft,
  ProductRuleCreateDraftInput,
  ProductChoiceProductConfiguration,
  AddRuleFromLibraryResult,
  ProductRuleDay, ProductRuleOrderType,
} from './product-editor.model';
import {RestaurantRuleResponse} from '../../rule/dto/rule-admin.dto';

const DEFAULT_IMAGE_URL = 'assets/img/product-placeholder.png';
const DEFAULT_PREPARATION_TIME_MINUTES = 10;
type RuleConditionSignatureInput = {
  variantId?: string | null;
  optionGroupId?: string | null;
  optionItemId?: string | null;
  orderType?: string | null;
  daysOfWeek?: readonly unknown[] | null;
  timeFrom?: string | null;
  timeTo?: string | null;
  selectedOptionItemIds?: readonly unknown[] | null;
};

type RuleActionSignatureInput = {
  visible?: boolean | null;
  available?: boolean | null;
  required?: boolean | null;
  minSelections?: number | null;
  maxSelections?: number | null;
  includedSelections?: number | null;
  priceDeltaOverride?: number | string | null;
};

const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || createId();

const DEFAULT_DRAFT: ProductDraft = {
  title: '',
  status: 'DRAFT',
  internalName: '',
  shortDescription: '',
  description: '',
  basePrice: 0,
  compareAtPrice: undefined,
  categoryIds: [],
  imageUrl: DEFAULT_IMAGE_URL,
  variants: [
    {
      id: createId(),
      name: 'Standard',
      sku: undefined,
      priceAdjustment: 0,
      compareAtPrice: null,
      isDefault: true,
      isAvailable: true,
      displayOrder: 0,
      optionGroups: [],
    },
  ],
  choices: [],
  rules: [],
};

const DEFAULT_LIBRARY_CHOICES: OptionGroupLibraryItem[] = [];
type VariantOptionGroupDraftItem =
  ProductVariantDraft['optionGroups'][number];

@Injectable()
export class ProductEditorStore {
  readonly steps: ProductWizardStep[] = [
    {id: 'general', label: 'adminProductWizard.steps.general', index: 1},
    {id: 'pricing', label: 'adminProductWizard.steps.pricing', index: 2},
    {id: 'formats', label: 'adminProductWizard.steps.formats', index: 3},
    {id: 'choices', label: 'adminProductWizard.steps.commonChoices', index: 4},
    {
      id: 'format-configuration',
      label: 'adminProductWizard.steps.formatConfiguration',
      index: 5,
    },
    {id: 'rules', label: 'adminProductWizard.steps.conditions', index: 6},
    {id: 'preview', label: 'adminProductWizard.steps.preview', index: 7},
  ];

  private readonly draftSignal = signal<ProductDraft>(
    structuredClone(DEFAULT_DRAFT)
  );

  private readonly currentStepSignal =
    signal<ProductWizardStepId>('general');

  private readonly selectedVariantIdSignal = signal<string | null>(null);

  private readonly categoriesSignal =
    signal<ProductCategoryResponse[]>([]);

  private readonly libraryChoicesSignal =
    signal<OptionGroupLibraryItem[]>(DEFAULT_LIBRARY_CHOICES);

  readonly draft = this.draftSignal.asReadonly();
  readonly currentStep = this.currentStepSignal.asReadonly();
  readonly selectedVariantId = this.selectedVariantIdSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly libraryChoices = this.libraryChoicesSignal.asReadonly();

  readonly currentStepIndex = computed(() => {
    const step = this.steps.find(
      (item) => item.id === this.currentStepSignal()
    );

    return step?.index ?? 1;
  });

  readonly selectedVariant = computed(() => {
    const draft = this.draftSignal();
    const selectedId = this.selectedVariantIdSignal();

    if (selectedId) {
      const selectedVariant = draft.variants.find(
        (variant) => variant.id === selectedId
      );

      if (selectedVariant) {
        return selectedVariant;
      }
    }

    return (
      draft.variants.find((variant) => variant.isDefault) ??
      draft.variants[0] ??
      null
    );
  });

  readonly previewPrice = computed(() => {
    const draft = this.draftSignal();
    const variant = this.selectedVariant();

    return draft.basePrice + (variant?.priceAdjustment ?? 0);
  });

  readonly validationErrors = computed<ProductValidationError[]>(() => {
    const draft = this.draftSignal();
    const errors: ProductValidationError[] = [];

    this.validateGeneralInformation(draft, errors);
    this.validateVariants(draft, errors);
    this.validateChoices(draft, errors);
    this.validateVariantChoices(draft, errors);
    this.validateCompareAtPrice(draft, errors);

    return errors;
  });

  readonly canPublish = computed(() => this.validationErrors().length === 0);

  readonly availableLibraryChoices = computed(() => {
    const usedOptionGroupIds = new Set(
      this.draftSignal()
        .choices
        .map((choice) => choice.optionGroupId ?? choice.duplicatedFromOptionGroupId)
        .filter((id): id is string => Boolean(id))
    );

    return this.libraryChoicesSignal().filter(
      (choice) => !usedOptionGroupIds.has(choice.id)
    );
  });

  readonly addedLibraryRuleIds = computed(() =>
    this.draftSignal()
      .rules
      .map((rule) => rule.sourceRuleId)
      .filter((id): id is string => !!id)
  );

  readonly currentRuleBusinessSignatures = computed(() =>
    this.draftSignal()
      .rules
      .map((rule) => this.buildRuleBusinessSignature(rule))
  );

  isLibraryRuleAlreadyDefined(rule: RestaurantRuleResponse): boolean {
    return (
      this.hasRuleFromSameSource(rule.id) ||
      this.hasSameBusinessRuleAsLibraryRule(rule)
    );
  }

  setStep(step: ProductWizardStepId): void {
    this.currentStepSignal.set(step);
  }

  nextStep(): void {
    const currentIndex = this.steps.findIndex(
      (step) => step.id === this.currentStepSignal()
    );

    const nextStep = this.steps[currentIndex + 1];

    if (nextStep) {
      this.currentStepSignal.set(nextStep.id);
    }
  }

  previousStep(): void {
    const currentIndex = this.steps.findIndex(
      (step) => step.id === this.currentStepSignal()
    );

    const previousStep = this.steps[currentIndex - 1];

    if (previousStep) {
      this.currentStepSignal.set(previousStep.id);
    }
  }

  updateGeneralInfo(value: Partial<ProductDraft>): void {
    this.patchDraft(value);
  }

  updateStatus(status: ProductStatus): void {
    this.draftSignal.update((draft) => ({
      ...draft,
      status,
    }));
  }

  updatePricing(basePrice: number, compareAtPrice?: number): void {
    this.patchDraft({
      basePrice: this.toMoney(basePrice),
      compareAtPrice,
    });
  }

  setCategories(categories: ProductCategoryResponse[]): void {
    this.categoriesSignal.set(categories);
  }

  addCategory(category: ProductCategoryResponse): void {
    this.categoriesSignal.update((categories) => [...categories, category]);
  }

  selectCategories(categoryIds: string[]): void {
    this.patchDraft({
      categoryIds: [...new Set(categoryIds)],
    });
  }

  selectCategory(categoryId: string): void {
    this.selectCategories([categoryId]);
  }

  setLibraryChoices(choices: OptionGroupLibraryItem[]): void {
    this.libraryChoicesSignal.set(choices);
  }

  addVariant(): void {
    const draft = this.draftSignal();

    const variant: ProductVariantDraft = {
      id: createId(),
      name: `Format ${draft.variants.length + 1}`,
      sku: undefined,
      priceAdjustment: 0,
      compareAtPrice: null,
      isDefault: draft.variants.length === 0,
      isAvailable: true,
      displayOrder: draft.variants.length,
      optionGroups: [],
    };

    this.patchDraft({
      variants: [...draft.variants, variant],
    });

    this.selectedVariantIdSignal.set(variant.id);
  }

  updateVariant(
    variantId: string,
    value: Partial<ProductVariantDraft>
  ): void {
    this.patchDraft({
      variants: this.draftSignal().variants.map((variant) =>
        variant.id === variantId ? {...variant, ...value} : variant
      ),
    });
  }

  setDefaultVariant(variantId: string): void {
    this.patchDraft({
      variants: this.draftSignal().variants.map((variant) => ({
        ...variant,
        isDefault: variant.id === variantId,
      })),
    });

    this.selectedVariantIdSignal.set(variantId);
  }

  removeVariant(variantId: string): void {
    const draft = this.draftSignal();

    if (draft.variants.length === 1) {
      return;
    }

    const variants = this.normalizeDefaultVariant(
      draft.variants.filter((variant) => variant.id !== variantId)
    );

    const choices = draft.choices.map((choice) => {
      const {[variantId]: _removed, ...rulesByVariant} =
        choice.rulesByVariant;

      return {
        ...choice,
        rulesByVariant,
      };
    });

    this.patchDraft({
      variants,
      choices,
    });

    if (this.selectedVariantIdSignal() === variantId) {
      this.selectedVariantIdSignal.set(variants[0]?.id ?? null);
    }
  }

  selectVariant(variantId: string): void {
    this.selectedVariantIdSignal.set(variantId);
  }

  addCustomChoice(name = 'Nouveau choix'): void {
    const draft = this.draftSignal();

    const choice: ProductChoiceDraft = {
      id: createId(),
      source: 'custom',
      optionGroupId: undefined,
      duplicatedFromOptionGroupId: undefined,
      name,
      description: undefined,
      required: false,
      minSelections: 0,
      maxSelections: 1,
      displayOrder: draft.choices.length,
      items: [],
      itemOverrides: {},
      rulesByVariant: {},
    };

    this.patchDraft({
      choices: [...draft.choices, choice],
    });
  }

  addChoiceFromLibrary(
    optionGroupId: string,
    configuration: ProductChoiceProductConfiguration
  ): void {
    const draft = this.draftSignal();
    const libraryChoice = this.findLibraryChoice(optionGroupId);

    if (!libraryChoice) {
      return;
    }

    const alreadyAdded = draft.choices.some(
      (choice) => choice.optionGroupId === optionGroupId
    );

    if (alreadyAdded) {
      return;
    }

    const choice: ProductChoiceDraft = {
      id: createId(),
      source: 'library',
      optionGroupId: libraryChoice.id,
      duplicatedFromOptionGroupId: undefined,
      name: libraryChoice.name,
      description: libraryChoice.description,
      required: configuration.required,
      minSelections: configuration.minSelections,
      maxSelections: configuration.maxSelections,
      displayOrder: configuration.displayOrder,
      items: libraryChoice.items.map((item) => ({
        ...item,
        id: createId(),
        optionItemId: item.id,
      })),
      itemOverrides: {},
      rulesByVariant: {},
    };

    this.patchDraft({
      choices: [...draft.choices, choice],
    });
  }

  removeChoice(choiceId: string): void {
    const removedChoice = this.draftSignal().choices.find(
      (choice) => choice.id === choiceId
    );

    const removedClientId = removedChoice
      ? this.getChoiceClientId(removedChoice)
      : null;

    const choices = this.draftSignal()
      .choices
      .filter((choice) => choice.id !== choiceId)
      .map((choice, index) => ({
        ...choice,
        displayOrder: index,
      }));

    const variants = removedClientId
      ? this.draftSignal().variants.map((variant) => ({
        ...variant,
        optionGroups: variant.optionGroups.filter(
          (group) => group.optionGroupId !== removedClientId
        ),
      }))
      : this.draftSignal().variants;

    this.patchDraft({
      choices,
      variants,
    });
  }

  updateChoice(
    choiceId: string,
    value: Partial<ProductChoiceDraft>
  ): void {
    this.patchDraft({
      choices: this.draftSignal().choices.map((choice) =>
        choice.id === choiceId ? {...choice, ...value} : choice
      ),
    });
  }

  addChoiceItem(choiceId: string): void {
    this.patchDraft({
      choices: this.draftSignal().choices.map((choice) => {
        if (choice.id !== choiceId) {
          return choice;
        }

        return {
          ...choice,
          items: [
            ...choice.items,
            {
              id: createId(),
              name: `Option ${choice.items.length + 1}`,
              description: undefined,
              priceDelta: 0,
              isAvailable: true,
              displayOrder: choice.items.length,
            },
          ],
        };
      }),
    });
  }

  updateChoiceItem(
    choiceId: string,
    itemId: string,
    value: Partial<{
      name: string;
      description: string;
      priceDelta: number;
      isAvailable: boolean;
    }>
  ): void {
    this.patchDraft({
      choices: this.draftSignal().choices.map((choice) => {
        if (choice.id !== choiceId) {
          return choice;
        }

        return {
          ...choice,
          items: choice.items.map((item) =>
            item.id === itemId ? {...item, ...value} : item
          ),
        };
      }),
    });
  }

  updateChoiceVariantRule(
    choiceId: string,
    variantId: string,
    value: {
      required?: boolean;
      minSelections?: number;
      maxSelections?: number;
      includedSelections?: number;
      displayOrder?: number;
    }
  ): void {
    this.patchDraft({
      choices: this.draftSignal().choices.map((choice) => {
        if (choice.id !== choiceId) {
          return choice;
        }

        return {
          ...choice,
          rulesByVariant: {
            ...choice.rulesByVariant,
            [variantId]: {
              ...choice.rulesByVariant[variantId],
              ...value,
            },
          },
        };
      }),
    });
  }

  getChoicesForVariant(variantId: string): FormatChoiceView[] {
    const draft = this.draftSignal();
    const variant = draft.variants.find((item) => item.id === variantId);

    if (!variant) {
      return [];
    }

    const commonChoices = this.buildCommonChoicesForVariant(
      draft.choices,
      variantId
    );

    const commonChoiceIds = new Set(
      commonChoices.map((choice) => choice.optionGroupId)
    );

    const variantChoices = this.buildSpecificChoicesForVariant(
      variant,
      commonChoiceIds
    );

    return [...commonChoices, ...variantChoices].sort(
      (left, right) => left.displayOrder - right.displayOrder
    );
  }

  getVariantChoiceCount(variantId: string): number {
    return this.getChoicesForVariant(variantId).length;
  }

  availableLibraryChoicesForVariant(
    variantId: string
  ): OptionGroupLibraryItem[] {
    const usedOptionGroupIds = new Set(
      this.getChoicesForVariant(variantId).map(
        (choice) => choice.libraryOptionGroupId ?? choice.optionGroupId
      )
    );

    return this.libraryChoicesSignal().filter(
      (choice) => !usedOptionGroupIds.has(choice.id)
    );
  }

  addChoiceToVariantFromLibrary(
    variantId: string,
    optionGroupId: string,
    config: {
      required: boolean;
      minSelections: number;
      maxSelections: number;
      includedSelections: number;
      displayOrder: number;
    }
  ): void {
    const libraryChoice = this.findLibraryChoice(optionGroupId);

    if (!libraryChoice) {
      return;
    }

    const variantChoice: VariantOptionGroupDraft = {
      id: createId(),
      optionGroupId: createId(),
      libraryOptionGroupId: optionGroupId,
      name: libraryChoice.name,
      description: libraryChoice.description,
      required: config.required,
      minSelections: config.minSelections,
      maxSelections: config.maxSelections,
      includedSelections: config.includedSelections,
      displayOrder: config.displayOrder,
      items: libraryChoice.items.map((item) => ({
        ...item,
        id: createId(),
        optionItemId: item.id,
      })),
      itemOverrides: {},
    };

    this.patchDraft({
      variants: this.draftSignal().variants.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }

        const alreadyExists = variant.optionGroups.some(
          (choice) => choice.libraryOptionGroupId === optionGroupId
        );

        if (alreadyExists) {
          return variant;
        }

        return {
          ...variant,
          optionGroups: [...variant.optionGroups, variantChoice],
        };
      }),
    });
  }

  updateVariantChoiceRule(
    variantId: string,
    optionGroupId: string,
    patch: Partial<{
      required: boolean;
      minSelections: number;
      maxSelections: number;
      includedSelections: number;
      displayOrder: number;
    }>
  ): void {
    const commonChoice = this.draftSignal().choices.find(
      (choice) => this.getChoiceClientId(choice) === optionGroupId
    );

    if (commonChoice) {
      this.updateChoiceVariantRule(commonChoice.id, variantId, patch);
      return;
    }

    this.patchDraft({
      variants: this.draftSignal().variants.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }

        return {
          ...variant,
          optionGroups: variant.optionGroups.map((choice) =>
            choice.optionGroupId === optionGroupId
              ? {...choice, ...patch}
              : choice
          ),
        };
      }),
    });
  }

  removeChoiceFromVariant(variantId: string, optionGroupId: string): void {
    this.patchDraft({
      variants: this.draftSignal().variants.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }

        return {
          ...variant,
          optionGroups: variant.optionGroups.filter(
            (choice) => choice.optionGroupId !== optionGroupId
          ),
        };
      }),
    });
  }

  focusChoiceForFormat(_choiceId: string): void {
    // Réservé pour plus tard : scroll ou highlight dans l'étape format.
  }

  duplicateLibraryChoiceAsCustom(choiceId: string): void {
    this.patchDraft({
      choices: this.draftSignal().choices.map((choice) => {
        if (choice.id !== choiceId || choice.source !== 'library') {
          return choice;
        }

        return {
          id: createId(),
          source: 'custom' as const,
          optionGroupId: undefined,
          duplicatedFromOptionGroupId: choice.optionGroupId,
          name: `${choice.name} personnalisé`,
          description: choice.description,
          required: choice.required,
          minSelections: choice.minSelections,
          maxSelections: choice.maxSelections,
          displayOrder: choice.displayOrder,
          items: choice.items.map((item) => ({
            id: createId(),
            name: item.name,
            description: item.description,
            priceDelta: item.priceDelta,
            isAvailable: item.isAvailable,
            displayOrder: item.displayOrder,
          })),
          itemOverrides: {},
          rulesByVariant: Object.fromEntries(
            Object.entries(choice.rulesByVariant).map(([variantId, rule]) => [
              variantId,
              {...rule},
            ])
          ),
        };
      }),
    });
  }

  getVisibleChoiceItemCount(choiceId: string): number {
    const choice = this.draftSignal().choices.find(
      (item) => item.id === choiceId
    );

    if (!choice) {
      return 0;
    }

    return this.visibleChoiceItems(choice).length;
  }

  visibleChoiceItems(choice: ProductChoiceDraft): ProductChoiceItemDraft[] {
    return choice.items.filter((item) => {
      const key = this.getChoiceItemOverrideKey(item);
      return choice.itemOverrides[key]?.visible ?? item.isAvailable;
    });
  }

  isChoiceItemVisible(choiceId: string, itemId: string): boolean {
    const choice = this.draftSignal().choices.find(
      (item) => item.id === choiceId
    );

    if (!choice) {
      return false;
    }

    const item = choice.items.find((choiceItem) => choiceItem.id === itemId);

    if (!item) {
      return false;
    }

    const key = this.getChoiceItemOverrideKey(item);

    return choice.itemOverrides[key]?.visible ?? item.isAvailable;
  }

  updateChoiceItemVisibilityForProduct(
    choiceId: string,
    itemId: string,
    visible: boolean
  ): void {
    this.draftSignal.update((draft) => ({
      ...draft,
      choices: draft.choices.map((choice) =>
        choice.id === choiceId
          ? this.updateChoiceItemVisibility(choice, itemId, visible)
          : choice
      ),
    }));
  }


  loadProductForEdit(product: ProductEditResponse): void {
    const defaultDraft = structuredClone(DEFAULT_DRAFT);

    const variants = this.mapProductResponseVariants(product);
    const choices = this.mapProductResponseChoices(product);
    const rules = this.mapProductResponseRules(product);

    this.draftSignal.set({
      ...defaultDraft,
      status: product.status ?? 'DRAFT',
      title: this.readString(product, 'title'),
      internalName: this.readString(product, 'title'),
      shortDescription: this.readString(product, 'shortDescription'),
      description: this.readString(product, 'description'),
      basePrice: this.readMoney(this.readUnknown(product, 'basePrice'), 0),
      compareAtPrice: undefined,
      categoryIds: this.mapProductResponseCategoryIds(product),
      imageUrl:
        this.readString(product, 'thumb') ||
        defaultDraft.imageUrl ||
        DEFAULT_IMAGE_URL,
      variants: variants.length > 0 ? variants : defaultDraft.variants,
      choices,
      rules,
    });

    this.selectedVariantIdSignal.set(
      variants.find((variant) => variant.isDefault)?.id ??
      variants[0]?.id ??
      defaultDraft.variants[0]?.id ??
      null
    );

    this.currentStepSignal.set('general');
  }

  private mapProductResponseRules(
    product: ProductEditResponse
  ): ProductRuleDraft[] {
    return (product.rules ?? []).map((rule, index): ProductRuleDraft => {
      const condition = rule.condition ?? {};
      const action = rule.action ?? {};

      return {
        id: rule.id,
        sourceRuleId: rule.sourceRuleId ?? undefined,

        label: rule.name ?? `Règle ${index + 1}`,
        description: rule.description ?? undefined,

        enabled: rule.enabled ?? true,
        type: this.toProductRuleType(rule.type),
        targetType: this.toProductRuleTargetType(rule.targetType),

        targetId:
          rule.variantClientId ??
          rule.optionGroupClientId ??
          rule.optionItemId ??
          undefined,

        condition: {
          variantId:
            rule.variantClientId ??
            condition.variantId ??
            undefined,

          optionGroupId:
            rule.optionGroupClientId ??
            condition.optionGroupId ??
            undefined,

          optionItemId:
            rule.optionItemId ??
            condition.optionItemId ??
            undefined,

          orderType: this.toProductRuleOrderType(condition.orderType),
          daysOfWeek: this.toProductRuleDays(condition.daysOfWeek ?? []),
          timeFrom: condition.timeFrom ?? undefined,
          timeTo: condition.timeTo ?? undefined,
          selectedOptionItemIds: condition.selectedOptionItemIds ?? [],
        },

        action: {
          visible: action.visible ?? undefined,
          available: action.available ?? undefined,
          required: action.required ?? undefined,
          minSelections: action.minSelections ?? undefined,
          maxSelections: action.maxSelections ?? undefined,
          includedSelections: action.includedSelections ?? undefined,
          priceDeltaOverride: action.priceDeltaOverride ?? undefined,
        },

        priority: rule.priority ?? index,

        reusable: rule.reusable ?? false,
        favorite: rule.favorite ?? false,
        customerVisible: rule.customerVisible ?? false,
        customerTitle: rule.customerTitle ?? undefined,
        customerDescription: rule.customerDescription ?? undefined,
        tags: rule.tags ?? [],
      };
    });
  }


  private toProductRuleType(
    value: string | null | undefined
  ): ProductRuleType {
    switch (value) {
      case 'AVAILABILITY':
      case 'VISIBILITY':
      case 'SELECTION_RULE':
      case 'PRICE_RULE':
      case 'INCLUDED_OPTION':
        return value;
      default:
        return 'AVAILABILITY';
    }
  }


  private toProductRuleTargetType(targetType: string | null | undefined) {
    switch (targetType){
      case  'RESTAURANT':
      case  'PRODUCT':
      case  'VARIANT':
      case  'OPTION_GROUP':
      case  'OPTION_ITEM':
        return targetType;
      default:
        return 'PRODUCT';
    }
  }

  private mapProductResponseCategoryIds(product: ProductEditResponse): string[] {
    const categories = this.readUnknown(product, 'categories');

    if (!Array.isArray(categories)) {
      return [];
    }

    return categories
      .map((category) => this.readString(category, 'id'))
      .filter(Boolean);
  }

  private mapProductResponseVariants(product: ProductEditResponse): ProductVariantDraft[] {
    const variants = this.readUnknown(product, 'variants');

    if (!Array.isArray(variants)) {
      return [];
    }

    return variants.map((variant, index) => ({
      id: this.readString(variant, 'id') || createId(),
      name: this.readString(variant, 'name') || `Format ${index + 1}`,
      sku: this.optionalText(this.readString(variant, 'sku')),
      priceAdjustment: this.readMoney(
        this.readUnknown(variant, 'priceAdjustment'),
        0
      ),
      compareAtPrice: this.readNullableMoney(
        this.readUnknown(variant, 'compareAtPrice')
      ),
      isDefault: this.readBoolean(variant, 'isDefault', index === 0),
      isAvailable: this.readBoolean(variant, 'isAvailable', true),
      displayOrder: this.readInteger(
        this.readUnknown(variant, 'displayOrder'),
        index
      ),
      optionGroups: this.mapProductResponseVariantOptionGroups(variant),
    }));
  }

  private mapProductResponseVariantOptionGroups(
    variant: ProductEditVariantResponse
  ): VariantOptionGroupDraftItem[] {
    return (variant.optionGroups ?? [])
      .map((optionGroup, index): VariantOptionGroupDraftItem | null => {
        const optionGroupId =
          optionGroup.optionGroupId ||
          optionGroup.optionGroupClientId;

        if (!optionGroupId) {
          return null;
        }

        const libraryOptionGroup = this.libraryChoicesSignal().find(
          (item) => item.id === optionGroupId
        );

        if (!libraryOptionGroup) {
          console.warn(
            'Option group de variante introuvable dans la bibliothèque',
            optionGroupId
          );

          return null;
        }

        return {
          id: optionGroup.id ?? optionGroupId,
          optionGroupId,

          name: libraryOptionGroup.name,

          required:
            optionGroup.requiredOverride ??
            libraryOptionGroup.required,

          minSelections:
            optionGroup.minSelectOverride ??
            libraryOptionGroup.minSelections,

          maxSelections:
            optionGroup.maxSelectOverride ??
            libraryOptionGroup.maxSelections,

          includedSelections:
            optionGroup.includedSelectionsOverride ?? 0,

          displayOrder:
            optionGroup.displayOrder ?? index,

          items: libraryOptionGroup.items.map((item, itemIndex) => ({
            id: item.id,
            optionItemId: item.id,
            name: item.name,
            description: item.description,
            priceDelta: item.priceDelta,
            isAvailable: item.isAvailable,
            displayOrder: item.displayOrder ?? itemIndex,
          })),

          itemOverrides: {},
        };
      })
      .filter(
        (optionGroup): optionGroup is VariantOptionGroupDraftItem =>
          optionGroup !== null
      );
  }

  private mapProductResponseChoices(product: ProductEditResponse): ProductChoiceDraft[] {
    const optionGroups = this.readUnknown(product, 'optionGroups');

    if (!Array.isArray(optionGroups)) {
      return [];
    }

    return optionGroups.map((optionGroup, index) => {
      const optionGroupId =
        this.readString(optionGroup, 'optionGroupId') ||
        this.readString(optionGroup, 'id');

      return {
        id: createId(),
        source: optionGroupId ? 'library' as const : 'custom' as const,
        optionGroupId: optionGroupId || undefined,
        duplicatedFromOptionGroupId: undefined,
        name:
          this.readString(optionGroup, 'name') ||
          this.readString(optionGroup, 'label') ||
          `Choix ${index + 1}`,
        description: this.optionalText(
          this.readString(optionGroup, 'description')
        ),
        required: this.readBoolean(
          optionGroup,
          'requiredOverride',
          this.readBoolean(optionGroup, 'required', false)
        ),
        minSelections: this.readInteger(
          this.readUnknown(optionGroup, 'minSelectOverride') ??
          this.readUnknown(optionGroup, 'minSelections'),
          0
        ),
        maxSelections: this.readInteger(
          this.readUnknown(optionGroup, 'maxSelectOverride') ??
          this.readUnknown(optionGroup, 'maxSelections'),
          1
        ),
        displayOrder: this.readInteger(
          this.readUnknown(optionGroup, 'displayOrder'),
          index
        ),
        items: this.mapProductResponseChoiceItems(optionGroup),
        itemOverrides: {},
        rulesByVariant: {},
      };
    });
  }

  private mapProductResponseChoiceItems(source: unknown): ProductChoiceItemDraft[] {
    const items =
      this.readUnknown(source, 'items') ??
      this.readUnknown(source, 'optionItems');

    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item, index) => ({
      id: createId(),
      optionItemId:
        this.readString(item, 'optionItemId') ||
        this.readString(item, 'id') ||
        undefined,
      name: this.readString(item, 'name') || `Option ${index + 1}`,
      description: this.optionalText(this.readString(item, 'description')),
      priceDelta: this.readMoney(this.readUnknown(item, 'priceDelta'), 0),
      isAvailable: this.readBoolean(item, 'isAvailable', true),
      displayOrder: this.readInteger(
        this.readUnknown(item, 'displayOrder'),
        index
      ),
    }));
  }

  private readUnknown(source: unknown, key: string): unknown {
    if (source === null || source === undefined) {
      return undefined;
    }

    return (source as Record<string, unknown>)[key];
  }

  private readString(source: unknown, key: string): string {
    const value = this.readUnknown(source, key);

    return typeof value === 'string' ? value : '';
  }

  private readBoolean(
    source: unknown,
    key: string,
    fallback: boolean
  ): boolean {
    const value = this.readUnknown(source, key);

    return typeof value === 'boolean' ? value : fallback;
  }

  private readInteger(value: unknown, fallback: number): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.max(0, Math.floor(parsed));
  }

  private readMoney(value: unknown, fallback: number): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.round(parsed * 100) / 100;
  }

  private readNullableMoney(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return this.readMoney(value, 0);
  }


  private buildCommonChoicesForVariant(
    choices: ProductChoiceDraft[],
    variantId: string
  ): FormatChoiceView[] {
    return choices.map((choice) => {
      const override = choice.rulesByVariant[variantId];
      const optionGroupId = this.getChoiceClientId(choice);

      return {
        id: `${variantId}-${optionGroupId}-common`,
        scope: 'common',
        optionGroupId,
        libraryOptionGroupId: choice.optionGroupId,
        name: choice.name,
        required: override?.required ?? choice.required,
        minSelections: override?.minSelections ?? choice.minSelections,
        maxSelections: override?.maxSelections ?? choice.maxSelections,
        includedSelections: override?.includedSelections ?? 0,
        displayOrder: override?.displayOrder ?? choice.displayOrder,
        items: this.visibleChoiceItems(choice),
      };
    });
  }

  private buildSpecificChoicesForVariant(
    variant: ProductVariantDraft,
    commonChoiceIds: Set<string>
  ): FormatChoiceView[] {
    return variant.optionGroups
      .filter((choice) => !commonChoiceIds.has(choice.optionGroupId))
      .map((choice) => ({
        id: `${variant.id}-${choice.optionGroupId}-variant`,
        scope: 'variant',
        optionGroupId: choice.optionGroupId,
        libraryOptionGroupId: choice.libraryOptionGroupId,
        name: choice.name,
        required: choice.required,
        minSelections: choice.minSelections,
        maxSelections: choice.maxSelections,
        includedSelections: choice.includedSelections,
        displayOrder: choice.displayOrder,
        items: this.visibleVariantChoiceItems(choice),
      }));
  }

  private visibleVariantChoiceItems(
    choice: VariantOptionGroupDraft
  ): ProductChoiceItemDraft[] {
    return choice.items.filter((item) => {
      const key = this.getChoiceItemOverrideKey(item);
      return choice.itemOverrides[key]?.visible ?? item.isAvailable;
    });
  }

  updateChoiceItemVisibility(
    choice: ProductChoiceDraft,
    itemId: string,
    visible: boolean
  ): ProductChoiceDraft {
    const itemToUpdate = choice.items.find((item) => item.id === itemId);

    if (!itemToUpdate) {
      return choice;
    }

    const overrideKey = this.getChoiceItemOverrideKey(itemToUpdate);

    const itemOverrides = {
      ...choice.itemOverrides,
      [overrideKey]: {visible},
    };

    const visibleItemCount = choice.items.filter((item) => {
      const key = this.getChoiceItemOverrideKey(item);
      return itemOverrides[key]?.visible ?? item.isAvailable;
    }).length;

    return {
      ...choice,
      itemOverrides,
      maxSelections: Math.min(choice.maxSelections, visibleItemCount),
      minSelections: Math.min(
        choice.minSelections,
        Math.min(choice.maxSelections, visibleItemCount)
      ),
    };
  }

  private validateGeneralInformation(
    draft: ProductDraft,
    errors: ProductValidationError[]
  ): void {
    if (!draft.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Le nom du produit est obligatoire.',
      });
    }

    if (draft.basePrice < 0) {
      errors.push({
        field: 'basePrice',
        message: 'Le prix de base ne peut pas être négatif.',
      });
    }

    if (draft.categoryIds.length === 0) {
      errors.push({
        field: 'categoryIds',
        message: 'Veuillez sélectionner une catégorie.',
      });
    }
  }

  private validateVariants(
    draft: ProductDraft,
    errors: ProductValidationError[]
  ): void {
    if (!draft.variants.length) {
      errors.push({
        field: 'variants',
        message: 'Le produit doit avoir au moins un format.',
      });
      return;
    }

    const defaultVariants = draft.variants.filter(
      (variant) => variant.isDefault
    );

    if (defaultVariants.length !== 1) {
      errors.push({
        field: 'variants',
        message: 'Le produit doit avoir exactement un format par défaut.',
      });
    }
  }

  private validateChoices(
    draft: ProductDraft,
    errors: ProductValidationError[]
  ): void {
    for (const choice of draft.choices) {
      errors.push(...this.validateChoice(choice));
    }
  }

  private validateVariantChoices(
    draft: ProductDraft,
    errors: ProductValidationError[]
  ): void {
    for (const variant of draft.variants) {
      for (const choice of this.getChoicesForVariant(variant.id)) {
        if (choice.minSelections > choice.maxSelections) {
          errors.push({
            field: `variant.${variant.id}.choice.${choice.optionGroupId}.minMax`,
            message: `Dans ${variant.name}, le minimum du choix "${choice.name}" ne peut pas dépasser le maximum.`,
          });
        }

        if (choice.includedSelections > choice.maxSelections) {
          errors.push({
            field: `variant.${variant.id}.choice.${choice.optionGroupId}.included`,
            message: `Dans ${variant.name}, le nombre inclus pour "${choice.name}" ne peut pas dépasser le maximum.`,
          });
        }
      }
    }
  }

  private validateCompareAtPrice(
    draft: ProductDraft,
    errors: ProductValidationError[]
  ): void {
    if (
      draft.compareAtPrice !== undefined &&
      draft.compareAtPrice <= this.previewPrice()
    ) {
      errors.push({
        field: 'compareAtPrice',
        message: 'Le prix barré doit être supérieur au prix affiché.',
      });
    }
  }

  private validateChoice(choice: ProductChoiceDraft): ProductValidationError[] {
    const errors: ProductValidationError[] = [];
    const visibleItemCount = this.visibleChoiceItems(choice).length;

    if (choice.required && choice.minSelections < 1) {
      errors.push({
        field: `choice.${choice.id}.minSelections`,
        message: 'adminProductWizard.choiceConfiguration.validation.requiredMin',
      });
    }

    if (choice.required && choice.maxSelections < 1) {
      errors.push({
        field: `choice.${choice.id}.maxSelections`,
        message: 'adminProductWizard.choiceConfiguration.validation.requiredMax',
      });
    }

    if (choice.minSelections > choice.maxSelections) {
      errors.push({
        field: `choice.${choice.id}.minMax`,
        message: 'adminProductWizard.choiceConfiguration.validation.minGreaterThanMax',
      });
    }

    if (choice.maxSelections > visibleItemCount) {
      errors.push({
        field: `choice.${choice.id}.maxSelections`,
        message:
          'adminProductWizard.choiceConfiguration.validation.maxGreaterThanAvailableOptions',
      });
    }

    return errors;
  }

  private normalizeDefaultVariant(
    variants: ProductVariantDraft[]
  ): ProductVariantDraft[] {
    if (variants.some((variant) => variant.isDefault)) {
      return variants;
    }

    return variants.map((variant, index) => ({
      ...variant,
      isDefault: index === 0,
    }));
  }

  private findLibraryChoice(
    optionGroupId: string
  ): OptionGroupLibraryItem | undefined {
    return this.libraryChoicesSignal().find(
      (choice) => choice.id === optionGroupId
    );
  }

  private patchDraft(value: Partial<ProductDraft>): void {
    this.draftSignal.update((draft) => ({
      ...draft,
      ...value,
    }));
  }

  private getChoiceClientId(choice: ProductChoiceDraft): string {
    return choice.id;
  }

  private getChoiceItemOverrideKey(item: ProductChoiceItemDraft): string {
    return item.optionItemId ?? item.id;
  }

  private optionalText(value: string | null | undefined): string | undefined {
    const trimmed = String(value ?? '').trim();

    return trimmed.length > 0 ? trimmed : undefined;
  }

  private toMoney(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.round(value * 100) / 100;
  }


  updateRule(ruleId: string, value: Partial<ProductRuleDraft>): void {
    this.patchDraft({
      rules: this.draftSignal().rules.map((rule) =>
        rule.id === ruleId
          ? {
            ...rule,
            ...value,
          }
          : rule
      ),
    });
  }

  removeRule(ruleId: string): void {
    this.patchDraft({
      rules: this.draftSignal().rules.filter(
        (rule) => rule.id !== ruleId
      ),
    });
  }


  updateRuleCustomerTitle(ruleId: string, customerTitle: string): void {
    this.updateRule(ruleId, {customerTitle});
  }

  private createDefaultTargetType(type: ProductRuleType) {
    switch (type) {
      case 'VISIBILITY':
      case 'SELECTION_RULE':
      case 'INCLUDED_OPTION':
        return 'OPTION_GROUP' as const;

      case 'AVAILABILITY':
      case 'PRICE_RULE':
        return 'PRODUCT' as const;
    }
  }

  private createDefaultRule(): ProductRuleConditionDraft {
    return {
      daysOfWeek: [],
      timeFrom: undefined,
      timeTo: undefined,
      orderType: undefined,
      variantId: undefined,
      optionGroupId: undefined,
      optionItemId: undefined,
      selectedOptionItemIds: [],
    };
  }

  private createDefaultRuleAction(type: ProductRuleType): ProductRuleActionDraft {
    switch (type) {
      case 'AVAILABILITY':
        return {available: true};
      case 'VISIBILITY':
        return {visible: true};
      case 'SELECTION_RULE':
        return {required: true, minSelections: 1, maxSelections: 1};
      case 'INCLUDED_OPTION':
        return {includedSelections: 1};
      case 'PRICE_RULE':
        return {priceDeltaOverride: 0};
    }
  }

  addRule(input: ProductRuleCreateDraftInput): void {
    const draft = this.draftSignal();

    const rule: ProductRuleDraft = {
      id: createId(),
      label: input.label,
      description: input.description,
      enabled: true,
      type: input.type,
      targetType: this.createDefaultTargetType(input.type),
      targetId: undefined,
      condition: this.createDefaultRule(),
      action: this.createDefaultRuleAction(input.type),
      priority: this.getNextRulePriority(draft.rules),

      reusable: false,
      favorite: false,
      customerVisible: false,
      customerTitle: undefined,
      customerDescription: undefined,
      tags: input.tags ?? [],
    };

    this.patchDraft({
      rules: [...draft.rules, rule],
    });
  }

  addRuleFromLibrary(rule: RestaurantRuleResponse): AddRuleFromLibraryResult {
    if (this.hasRuleFromSameSource(rule.id)) {
      return {
        added: false,
        reason: 'SOURCE_ALREADY_ADDED',
      };
    }

    if (this.hasSameBusinessRuleAsLibraryRule(rule)) {
      return {
        added: false,
        reason: 'BUSINESS_RULE_ALREADY_EXISTS',
      };
    }

    const draft = this.draftSignal();

    const importedRule: ProductRuleDraft = {
      id: createId(),
      sourceRuleId: rule.id,

      label: rule.name,
      description: rule.description,
      enabled: rule.active,
      type: rule.type,
      targetType: this.createDefaultTargetType(rule.type),
      targetId: undefined,

      condition: {
        variantId: undefined,
        optionGroupId: undefined,
        optionItemId: undefined,
        orderType: this.toProductRuleOrderType(rule.condition.orderType),
        daysOfWeek: this.toProductRuleDays(rule.condition.daysOfWeek ?? []),
        timeFrom: rule.condition.timeFrom,
        timeTo: rule.condition.timeTo,
        selectedOptionItemIds: rule.condition.selectedOptionItemIds ?? [],
      },

      action: {
        visible: rule.action.visible,
        available: rule.action.available,
        required: rule.action.required,
        minSelections: rule.action.minSelections,
        maxSelections: rule.action.maxSelections,
        includedSelections: rule.action.includedSelections,
        priceDeltaOverride: rule.action.priceDeltaOverride,
      },

      priority: this.getNextRulePriority(draft.rules),

      reusable: true,
      favorite: rule.favorite,
      customerVisible: rule.customerVisible,
      customerTitle: rule.customerTitle,
      customerDescription: rule.customerDescription,
      tags: rule.tags.map((tag) => tag.name),
    };

    this.patchDraft({
      rules: [...draft.rules, importedRule],
    });

    return {
      added: true,
    };
  }

  private hasRuleFromSameSource(sourceRuleId: string): boolean {
    return this.draftSignal().rules.some(
      (rule) => rule.sourceRuleId === sourceRuleId
    );
  }

  private hasSameBusinessRuleAsLibraryRule(
    libraryRule: RestaurantRuleResponse
  ): boolean {
    const librarySignature =
      this.buildLibraryRuleBusinessSignature(libraryRule);

    return this.currentRuleBusinessSignatures().includes(librarySignature);
  }

  private buildLibraryRuleBusinessSignature(
    rule: RestaurantRuleResponse
  ): string {
    return [
      `type=${this.normalize(rule.type)}`,
      `targetType=${this.normalize(this.createDefaultTargetType(rule.type))}`,
      `targetId=null`,
      `condition=${this.buildConditionSignature(rule.condition)}`,
      `action=${this.buildActionSignature(rule.action)}`,
    ].join('|');
  }

  private buildRuleBusinessSignature(rule: ProductRuleDraft): string {
    return [
      `type=${this.normalize(rule.type)}`,
      `targetType=${this.normalize(rule.targetType)}`,
      `targetId=${this.normalize(rule.targetId)}`,
      `condition=${this.buildConditionSignature(rule.condition)}`,
      `action=${this.buildActionSignature(rule.action)}`,
    ].join('|');
  }

  private toProductRuleOrderType(
    value: string | null | undefined
  ): ProductRuleOrderType | undefined {
    if (value === 'DELIVERY' || value === 'PICKUP') {
      return value;
    }

    return undefined;
  }

  private toProductRuleDay(
    value: string | null | undefined
  ): ProductRuleDay | undefined {
    switch (value) {
      case 'MONDAY':
      case 'TUESDAY':
      case 'WEDNESDAY':
      case 'THURSDAY':
      case 'FRIDAY':
      case 'SATURDAY':
      case 'SUNDAY':
        return value;

      default:
        return undefined;
    }
  }

  private toProductRuleDays(
    values: readonly string[] | null | undefined
  ): ProductRuleDay[] {
    if (!values || values.length === 0) {
      return [];
    }

    return values
      .map((value) => this.toProductRuleDay(value))
      .filter((day): day is ProductRuleDay => !!day);
  }

  private buildConditionSignature(
    condition: RuleConditionSignatureInput | null | undefined
  ): string {
    if (!condition) {
      return 'condition:null';
    }

    return [
      `variantId=${this.normalize(condition.variantId)}`,
      `optionGroupId=${this.normalize(condition.optionGroupId)}`,
      `optionItemId=${this.normalize(condition.optionItemId)}`,
      `orderType=${this.normalize(condition.orderType)}`,
      `days=${this.normalizeStringList(condition.daysOfWeek)}`,
      `timeFrom=${this.normalize(condition.timeFrom)}`,
      `timeTo=${this.normalize(condition.timeTo)}`,
      `selectedOptions=${this.normalizeStringList(condition.selectedOptionItemIds)}`,
    ].join(';');
  }

  private buildActionSignature(
    action: RuleActionSignatureInput | null | undefined
  ): string {
    if (!action) {
      return 'action:null';
    }

    return [
      `visible=${this.normalize(action.visible)}`,
      `available=${this.normalize(action.available)}`,
      `required=${this.normalize(action.required)}`,
      `minSelections=${this.normalize(action.minSelections)}`,
      `maxSelections=${this.normalize(action.maxSelections)}`,
      `includedSelections=${this.normalize(action.includedSelections)}`,
      `priceDeltaOverride=${this.normalizeNumber(action.priceDeltaOverride)}`,
    ].join(';');
  }


  private normalize(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'null';
    }

    return String(value).trim().toLowerCase();
  }

  private normalizeNumber(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'null';
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return String(value).trim();
    }

    return numberValue.toString();
  }

  private normalizeStringList(
    values: readonly unknown[] | null | undefined
  ): string {
    if (!values || values.length === 0) {
      return '[]';
    }

    return [...values]
      .map((value) => this.normalize(value))
      .sort()
      .join(',');
  }

  updateRuleDescription(ruleId: string, description: string): void {
    this.updateRule(ruleId, {description});
  }

  updateRuleReusable(ruleId: string, reusable: boolean): void {
    const currentRule = this.draftSignal().rules.find((rule) => rule.id === ruleId);

    this.updateRule(ruleId, {
      reusable,
      favorite: reusable ? currentRule?.favorite ?? false : false,
    });
  }

  updateRuleFavorite(ruleId: string, favorite: boolean): void {
    this.updateRule(ruleId, {favorite});
  }

  updateRuleCustomerVisible(ruleId: string, customerVisible: boolean): void {
    this.updateRule(ruleId, {customerVisible});
  }

  updateRuleCustomerDescription(ruleId: string, customerDescription: string): void {
    this.updateRule(ruleId, {customerDescription});
  }

  updateRuleTags(ruleId: string, value: string | number | null | undefined): void {
    const tags = String(value ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.updateRule(ruleId, {tags});
  }


  private getNextRulePriority(rules: ProductRuleDraft[]): number {
    if (rules.length === 0) {
      return 10;
    }

    return Math.max(...rules.map((condition) => condition.priority)) + 10;
  }

  removeChoiceItem(
    choiceId: string,
    itemId: string
  ): void {
    this.patchDraft({
      choices: this.draftSignal().choices.map((choice) => {
        if (choice.id !== choiceId) {
          return choice;
        }

        // On ne supprime pas directement les options d'un choix venant de la bibliothèque.
        // Pour une bibliothèque, on masque l'option via updateChoiceItemVisibilityForProduct(...).
        if (choice.source === 'library') {
          return choice;
        }

        const itemToRemove = choice.items.find((item) => item.id === itemId);

        if (!itemToRemove) {
          return choice;
        }

        const overrideKey = this.getChoiceItemOverrideKey(itemToRemove);

        const {[overrideKey]: _removedOverride, ...itemOverrides} =
          choice.itemOverrides;

        const items = choice.items
          .filter((item) => item.id !== itemId)
          .map((item, index) => ({
            ...item,
            displayOrder: index,
          }));

        const visibleItemCount = items.filter((item) => {
          const key = this.getChoiceItemOverrideKey(item);

          return itemOverrides[key]?.visible ?? item.isAvailable;
        }).length;

        const nextMaxSelections = Math.min(
          choice.maxSelections,
          visibleItemCount
        );

        const nextMinSelections = Math.min(
          choice.minSelections,
          nextMaxSelections
        );

        return {
          ...choice,
          items,
          itemOverrides,
          minSelections: nextMinSelections,
          maxSelections: nextMaxSelections,
        };
      }),
    });
  }
}
