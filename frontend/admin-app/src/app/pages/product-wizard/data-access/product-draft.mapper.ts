  import { Injectable } from '@angular/core';

  import {
    ProductCreateRequest,
    ProductOptionGroupAssignmentRequest,
    ProductRuleActionRequest,
    ProductRuleConditionRequest,
    ProductRuleRequest,
    VariantOptionGroupAssignmentRequest,
  } from './product-admin.dto';

  import {
    ProductChoiceDraft,
    ProductDraft,
    ProductRuleDraft,
    ProductVariantDraft,
  } from '../state/product-editor.model';

  @Injectable({
    providedIn: 'root',
  })
  export class ProductDraftMapper {
    toCreateRequest(draft: ProductDraft): ProductCreateRequest {
      const sku = this.generateSku(draft.internalName || draft.title);
      const slug = this.generateSlug(draft.title);

      return {
        sku,
        slug,
        title: draft.title.trim(),
        shortDescription: this.toOptionalText(draft.shortDescription),
        description: this.toOptionalText(draft.description),
        thumb: draft.imageUrl,
        basePrice: this.toMoney(draft.basePrice),
        isAvailable: true,
        isFeatured: false,
        isArchived: false,
        categoryIds: draft.categoryIds,
        images: this.mapImages(draft),
        optionGroups: this.mapProductOptionGroups(draft),
        variants: draft.variants.map((variant) =>
          this.mapVariant(draft, variant)
        ),
        rules: this.mapRules(draft),
      };
    }

    private mapImages(draft: ProductDraft): ProductCreateRequest['images'] {
      if (!draft.imageUrl) {
        return [];
      }

      return [
        {
          url: draft.imageUrl,
          altText: draft.title.trim() || 'Produit',
          displayOrder: 0,
          primary: true,
        },
      ];
    }

    private mapVariant(
      draft: ProductDraft,
      variant: ProductVariantDraft
    ): ProductCreateRequest['variants'][number] {
      return {
        clientId: variant.id,
        name: variant.name.trim(),
        sku: this.toOptionalText(variant.sku) ?? this.generateSku(`${draft.title}-${variant.name}`),
        priceAdjustment: this.toMoney(variant.priceAdjustment),
        compareAtPrice:
          variant.compareAtPrice !== undefined && variant.compareAtPrice !== null
            ? this.toMoney(variant.compareAtPrice)
            : undefined,
        isDefault: variant.isDefault ?? false,
        isAvailable: variant.isAvailable ?? true,
        displayOrder: variant.displayOrder,
        optionGroups: this.mapVariantOptionGroups(draft, variant),
      };
    }

    private mapProductOptionGroups(
      draft: ProductDraft
    ): ProductOptionGroupAssignmentRequest[] {
      return draft.choices.map((choice) => ({
        clientId: choice.id,
        optionGroupId: choice.source === 'library' ? choice.optionGroupId : undefined,
        name: choice.source === 'custom' ? choice.name.trim() : undefined,
        description: choice.source === 'custom' ? choice.description : undefined,
        requiredOverride: choice.required,
        minSelectOverride: choice.minSelections,
        maxSelectOverride: choice.maxSelections,
        displayOrder: choice.displayOrder,
        items: choice.source === 'custom'
          ? choice.items.map((item) => ({
            name: item.name.trim(),
            description: item.description,
            priceDelta: this.toMoney(item.priceDelta),
            isAvailable: item.isAvailable,
            displayOrder: item.displayOrder,
          }))
          : undefined,
        optionItemOverrides: choice.source === 'library'
          ? this.mapOptionItemOverrides(choice)
          : undefined,
      }));
    }

    private mapVariantOptionGroups(
      draft: ProductDraft,
      variant: ProductVariantDraft
    ): VariantOptionGroupAssignmentRequest[] {
      const commonChoiceOverrides: VariantOptionGroupAssignmentRequest[] =
        draft.choices.flatMap((choice) => {
          const override = choice.rulesByVariant[variant.id];

          if (!override) {
            return [];
          }

          return [
            this.removeUndefined({
              optionGroupClientId: choice.id,
              requiredOverride: override.required,
              minSelectOverride: override.minSelections,
              maxSelectOverride: override.maxSelections,
              includedSelectionsOverride: override.includedSelections,
              displayOrder: override.displayOrder,
            }),
          ];
        });

      const variantSpecificChoices: VariantOptionGroupAssignmentRequest[] =
        variant.optionGroups.map((choice) =>
          this.removeUndefined({
            optionGroupId: choice.libraryOptionGroupId,
            optionGroupClientId: choice.optionGroupId,
            requiredOverride: choice.required,
            minSelectOverride: choice.minSelections,
            maxSelectOverride: choice.maxSelections,
            includedSelectionsOverride: choice.includedSelections,
            displayOrder: choice.displayOrder,
          })
        );

      return [
        ...commonChoiceOverrides,
        ...variantSpecificChoices,
      ];
    }

    private removeUndefined<T extends object>(value: T): T {
      return Object.fromEntries(
        Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
      ) as T;
    }

    private mapOptionItemOverrides(choice: ProductChoiceDraft) {
      return Object.entries(choice.itemOverrides).map(
        ([optionItemId, override]) => ({
          optionItemId,
          visible: override.visible ?? true,
        })
      );
    }

    private mapRules(draft: ProductDraft): ProductRuleRequest[] {
      return draft.rules.map((rule) => ({
        sourceRuleId: rule.sourceRuleId,

        name: this.resolveRuleName(rule),
        description: this.toOptionalText(rule.description),
        enabled: rule.enabled,
        favorite: rule.favorite ?? false,
        reusable: rule.reusable ?? false,
        customerVisible: rule.customerVisible ?? false,
        customerTitle: this.toOptionalText(rule.customerTitle),
        customerDescription: this.toOptionalText(rule.customerDescription),
        tags: rule.tags ?? [],
        type: rule.type,
        targetType: rule.targetType,
        variantClientId: this.resolveRuleVariantClientId(rule),
        optionGroupClientId: this.resolveRuleOptionGroupClientId(rule),
        optionItemId: rule.condition.optionItemId,
        condition: this.mapRuleCondition(rule),
        action: this.mapRuleAction(rule),
        priority: rule.priority,
      }));
    }

    private resolveRuleName(rule: ProductRuleDraft): string {
      const label = rule.label?.trim();

      if (label) {
        return label;
      }

      switch (rule.type) {
        case 'AVAILABILITY':
          return 'Règle de disponibilité';
        case 'VISIBILITY':
          return 'Règle de visibilité';
        case 'SELECTION_RULE':
          return 'Règle de sélection';
        case 'INCLUDED_OPTION':
          return 'Option incluse';
        case 'PRICE_RULE':
          return 'Règle de prix';
      }
    }

    private resolveRuleVariantClientId(rule: ProductRuleDraft): string | undefined {
      if (rule.targetType === 'VARIANT') {
        return this.toOptionalText(rule.targetId);
      }

      return this.toOptionalText(rule.condition.variantId);
    }

    private resolveRuleOptionGroupClientId(rule: ProductRuleDraft): string | undefined {
      if (rule.targetType === 'OPTION_GROUP') {
        return this.toOptionalText(rule.targetId);
      }

      return this.toOptionalText(rule.condition.optionGroupId);
    }

    private mapRuleCondition(rule: ProductRuleDraft): ProductRuleConditionRequest {
      return {
        orderType: rule.condition.orderType,
        daysOfWeek: rule.condition.daysOfWeek ?? [],
        timeFrom: this.toOptionalText(rule.condition.timeFrom),
        timeTo: this.toOptionalText(rule.condition.timeTo),
        selectedOptionItemIds: rule.condition.selectedOptionItemIds ?? [],
      };
    }

    private mapRuleAction(rule: ProductRuleDraft): ProductRuleActionRequest {
      return {
        visible: rule.action.visible,
        available: rule.action.available,
        required: rule.action.required,
        minSelections: rule.action.minSelections,
        maxSelections: rule.action.maxSelections,
        includedSelections: rule.action.includedSelections,
        priceDeltaOverride:
          rule.action.priceDeltaOverride !== undefined
            ? this.toMoney(rule.action.priceDeltaOverride)
            : undefined,
      };
    }

    private getChoiceClientId(choice: ProductChoiceDraft): string {
      return choice.id;
    }

    private generateSlug(value: string): string {
      const slug = value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return slug || `product-${Date.now()}`;
    }

    private generateSku(value: string): string {
      const slug = this.generateSlug(value);
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

      return `${slug}-${suffix}`.toUpperCase();
    }

    private toMoney(value: number | null | undefined): number {
      const parsed = Number(value ?? 0);

      if (!Number.isFinite(parsed)) {
        return 0;
      }

      return Math.round(parsed * 100) / 100;
    }

    private toOptionalText(value: string | null | undefined): string | undefined {
      const trimmed = String(value ?? '').trim();

      return trimmed ? trimmed : undefined;
    }
  }
