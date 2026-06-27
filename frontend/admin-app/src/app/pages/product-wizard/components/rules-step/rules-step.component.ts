import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToggle,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import {
  ProductRuleActionDraft,
  ProductRuleConditionDraft,
  ProductRuleDay,
  ProductRuleDraft,
  ProductRuleOrderType,
  ProductRuleTargetType,
  ProductRuleType,
  ProductVariantDraft,
} from '../../state/product-editor.model';

type SelectOption<T extends string> = {
  value: T;
  labelKey: string;
};

type BusinessRuleTemplate = {
  type: ProductRuleType;
  titleKey: string;
  helpKey: string;
  exampleKey: string;
};

type FormatChoiceOption = {
  optionGroupId: string;
  name: string;
};

type ValueChange<TValue> = {
  ruleId: string;
  value: TValue;
};

type DaySelectionChange = {
  ruleId: string;
  day: ProductRuleDay;
  checked: boolean;
};

@Component({
  selector: 'app-rules-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonBadge,
    IonButton,
    IonCheckbox,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToggle,
  ],
  templateUrl: './rules-step.component.html',
  styleUrls: ['./rules-step.component.scss'],
})
export class RulesStepComponent {
  private readonly translate = inject(TranslateService);

  readonly rules = input.required<ProductRuleDraft[]>();
  readonly variants = input.required<ProductVariantDraft[]>();
  readonly selectedFormatChoices = input.required<FormatChoiceOption[]>();
  readonly businessRuleTemplates = input.required<BusinessRuleTemplate[]>();
  readonly conditionDayOptions = input.required<SelectOption<ProductRuleDay>[]>();
  readonly orderTypeOptions = input.required<SelectOption<ProductRuleOrderType>[]>();

  readonly createRule = output<ProductRuleType>();
  readonly createAdvancedRule = output<void>();
  readonly openLibrary = output<void>();

  readonly ruleLabelChange = output<ValueChange<string | null | undefined>>();
  readonly ruleDescriptionChange = output<ValueChange<string | null | undefined>>();
  readonly ruleTypeChange = output<ValueChange<ProductRuleType>>();
  readonly ruleEnabledChange = output<ValueChange<boolean>>();
  readonly ruleRemove = output<string>();

  readonly targetTypeChange = output<ValueChange<ProductRuleTargetType>>();
  readonly variantTargetChange = output<{
    ruleId: string;
    value: string | null | undefined;
  }>();
  readonly optionGroupTargetChange = output<{
    ruleId: string;
    value: string | null | undefined;
  }>();
  readonly orderTypeChange = output<{
    ruleId: string;
    value: ProductRuleOrderType | null | undefined;
  }>();
  readonly daySelectionChange = output<{
    ruleId: string;
    day: ProductRuleDay;
    checked: boolean;
  }>();
  readonly timeFromChange = output<ValueChange<string | null | undefined>>();
  readonly timeToChange = output<ValueChange<string | null | undefined>>();

  readonly availableChange = output<ValueChange<boolean>>();
  readonly visibleChange = output<ValueChange<boolean>>();
  readonly requiredChange = output<ValueChange<boolean>>();
  readonly minSelectionsChange = output<ValueChange<string | number | null | undefined>>();
  readonly maxSelectionsChange = output<ValueChange<string | number | null | undefined>>();
  readonly includedSelectionsChange = output<ValueChange<string | number | null | undefined>>();
  readonly priceDeltaChange = output<ValueChange<string | number | null | undefined>>();

  readonly reusableChange = output<ValueChange<boolean>>();
  readonly favoriteChange = output<ValueChange<boolean>>();
  readonly tagsChange = output<ValueChange<string | number | null | undefined>>();
  readonly customerVisibleChange = output<ValueChange<boolean>>();
  readonly customerTitleChange = output<ValueChange<string | null | undefined>>();
  readonly customerDescriptionChange = output<ValueChange<string | null | undefined>>();

  readonly primaryTemplates = computed(() =>
    this.businessRuleTemplates().filter((template) =>
      template.type === 'AVAILABILITY' ||
      template.type === 'VISIBILITY' ||
      template.type === 'INCLUDED_OPTION' ||
      template.type === 'PRICE_RULE'
    )
  );

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  conditionKindLabelKey(type: ProductRuleType): string {
    switch (type) {
      case 'AVAILABILITY':
        return 'adminProductWizard.conditions.businessTemplates.availability.title';
      case 'VISIBILITY':
        return 'adminProductWizard.conditions.businessTemplates.visibility.title';
      case 'SELECTION_RULE':
        return 'adminProductWizard.conditions.businessTemplates.selection.title';
      case 'INCLUDED_OPTION':
        return 'adminProductWizard.conditions.businessTemplates.included.title';
      case 'PRICE_RULE':
        return 'adminProductWizard.conditions.businessTemplates.price.title';
    }
  }

  conditionKindHelpKey(type: ProductRuleType): string {
    switch (type) {
      case 'AVAILABILITY':
        return 'adminProductWizard.conditions.businessTemplates.availability.help';
      case 'VISIBILITY':
        return 'adminProductWizard.conditions.businessTemplates.visibility.help';
      case 'SELECTION_RULE':
        return 'adminProductWizard.conditions.businessTemplates.selection.help';
      case 'INCLUDED_OPTION':
        return 'adminProductWizard.conditions.businessTemplates.included.help';
      case 'PRICE_RULE':
        return 'adminProductWizard.conditions.businessTemplates.price.help';
    }
  }

  isConditionDaySelected(
    rule: ProductRuleDraft,
    day: ProductRuleDay
  ): boolean {
    return (rule.condition.daysOfWeek ?? []).includes(day);
  }

  conditionBusinessSummary(rule: ProductRuleDraft): string {
    return [
      this.describeConditionTarget(rule),
      this.describeConditionTiming(rule),
      this.describeConditionResult(rule),
    ]
      .filter(Boolean)
      .join(' · ');
  }

  shouldShowProductOrVariantTargets(rule: ProductRuleDraft): boolean {
    return rule.type === 'AVAILABILITY' || rule.type === 'PRICE_RULE';
  }

  shouldShowOptionGroupTargets(rule: ProductRuleDraft): boolean {
    return (
      rule.type === 'AVAILABILITY' ||
      rule.type === 'VISIBILITY' ||
      rule.type === 'SELECTION_RULE' ||
      rule.type === 'INCLUDED_OPTION'
    );
  }

  private describeConditionTarget(rule: ProductRuleDraft): string {
    if (rule.targetType === 'VARIANT') {
      const variant = this.variants().find(
        (item) => item.id === rule.targetId || item.id === rule.condition.variantId
      );

      return variant
        ? this.translate.instant('adminProductWizard.conditions.summary.targetVariant', {
            name: variant.name,
          })
        : this.translate.instant('adminProductWizard.conditions.summary.targetSelectedVariant');
    }

    if (rule.targetType === 'OPTION_GROUP') {
      const choice = this.selectedFormatChoices().find(
        (item) =>
          item.optionGroupId === rule.targetId ||
          item.optionGroupId === rule.condition.optionGroupId
      );

      return choice
        ? this.translate.instant('adminProductWizard.conditions.summary.targetChoice', {
            name: choice.name,
          })
        : this.translate.instant('adminProductWizard.conditions.summary.targetSelectedChoice');
    }

    return this.translate.instant('adminProductWizard.conditions.summary.targetProduct');
  }

  private describeConditionTiming(rule: ProductRuleDraft): string {
    const parts: string[] = [];

    if (rule.condition.variantId && rule.targetType !== 'VARIANT') {
      const variant = this.variants().find(
        (item) => item.id === rule.condition.variantId
      );

      if (variant) {
        parts.push(
          this.translate.instant('adminProductWizard.conditions.timing.forFormat', {
            name: variant.name,
          })
        );
      }
    }

    if (rule.condition.daysOfWeek?.length) {
      parts.push(
        this.translate.instant('adminProductWizard.conditions.timing.selectedDays')
      );
    }

    if (rule.condition.timeFrom || rule.condition.timeTo) {
      parts.push(
        this.translate.instant('adminProductWizard.conditions.timing.timeRange', {
          from: rule.condition.timeFrom ?? '--:--',
          to: rule.condition.timeTo ?? '--:--',
        })
      );
    }

    if (rule.condition.orderType === 'DELIVERY') {
      parts.push(this.translate.instant('adminProductWizard.conditions.timing.delivery'));
    }

    if (rule.condition.orderType === 'PICKUP') {
      parts.push(this.translate.instant('adminProductWizard.conditions.timing.pickup'));
    }

    return parts.length
      ? parts.join(' · ')
      : this.translate.instant('adminProductWizard.conditions.always');
  }

  private describeConditionResult(rule: ProductRuleDraft): string {
    switch (rule.type) {
      case 'AVAILABILITY':
        return rule.action.available === false
          ? this.translate.instant('adminProductWizard.conditions.summary.resultUnavailable')
          : this.translate.instant('adminProductWizard.conditions.summary.resultAvailable');

      case 'VISIBILITY':
        return rule.action.visible === false
          ? this.translate.instant('adminProductWizard.conditions.summary.resultHidden')
          : this.translate.instant('adminProductWizard.conditions.summary.resultVisible');

      case 'SELECTION_RULE':
        return this.translate.instant('adminProductWizard.conditions.summary.resultSelection', {
          min: rule.action.minSelections ?? 0,
          max: rule.action.maxSelections ?? 0,
        });

      case 'INCLUDED_OPTION':
        return this.translate.instant('adminProductWizard.conditions.summary.resultIncluded', {
          count: rule.action.includedSelections ?? 0,
        });

      case 'PRICE_RULE':
        return this.translate.instant('adminProductWizard.conditions.summary.resultPrice', {
          amount: rule.action.priceDeltaOverride ?? 0,
        });
    }
  }
  emitRuleLabelChange(
    ruleId: string,
    value: string | number | null | undefined
  ): void {
    this.ruleLabelChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }

  emitRuleDescriptionChange(
    ruleId: string,
    value: string | number | null | undefined
  ): void {
    this.ruleDescriptionChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }

  emitTimeFromChange(
    ruleId: string,
    value: string | number | null | undefined
  ): void {
    this.timeFromChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }

  emitTimeToChange(
    ruleId: string,
    value: string | number | null | undefined
  ): void {
    this.timeToChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }

  emitVariantTargetChange(
    ruleId: string,
    value: string | number | null | undefined
  ): void {
    this.variantTargetChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }

  emitOptionGroupTargetChange(
    ruleId: string,
    value: string | number | null | undefined
  ): void {
    this.optionGroupTargetChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }

  emitOrderTypeChange(
    ruleId: string,
    value: string | number | null | undefined
  ): void {
    this.orderTypeChange.emit({
      ruleId,
      value: this.toProductRuleOrderType(value),
    });
  }

  emitDaySelectionChange(
    ruleId: string,
    day: ProductRuleDay,
      checked: boolean
  ): void {
    this.daySelectionChange.emit({
      ruleId,
      day,
      checked,
    });
  }

  private toOptionalString(
    value: string | number | null | undefined
  ): string | undefined {
    const text = String(value ?? '').trim();

    return text.length > 0 ? text : undefined;
  }

  private toProductRuleOrderType(
    value: string | number | null | undefined
  ): ProductRuleOrderType | undefined {
    if (value === 'DELIVERY' || value === 'PICKUP') {
      return value;
    }

    return undefined;
  }

  emitCustomerTitleChange(
      ruleId: string,
      value: string | number | null | undefined
  ): void {
    this.customerTitleChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }

  emitCustomerDescriptionChange(
      ruleId: string,
      value: string | number | null | undefined
  ): void {
    this.customerDescriptionChange.emit({
      ruleId,
      value: this.toOptionalString(value),
    });
  }
}
