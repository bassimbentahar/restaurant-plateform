import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  OptionGroupAdminRequest,
} from '../../product-wizard/data-access/product-admin-api.service';
import { OptionGroupLibraryItem } from '../../product-wizard/state/product-editor.model';
import {
  RestaurantRuleCreateRequest,
  RestaurantRuleResponse,
  RestaurantRuleUpdateRequest,
} from '../../rule/dto/rule-admin.dto';

import { MenuLibraryApiService } from './menu-library-api.service';
import {
  AvailabilityEditorResult,
  ChoiceEditorResult,
  MenuLibraryCard,
  MenuLibraryCardMetadata,
  MenuLibraryRuleType,
  MenuLibraryTab,
  MenuLibraryTabId,
  OfferEditorResult,
} from './menu-library.model';

const OFFER_RULE_TYPES: MenuLibraryRuleType[] = [
  'PRICE_RULE',
  'INCLUDED_OPTION',
  'SELECTION_RULE',
];

const AVAILABILITY_RULE_TYPES: MenuLibraryRuleType[] = [
  'AVAILABILITY',
  'VISIBILITY',
];

@Injectable()
export class MenuLibraryFacade {
  private readonly api = inject(MenuLibraryApiService);

  private readonly choicesSignal = signal<OptionGroupLibraryItem[]>([]);
  private readonly rulesSignal = signal<RestaurantRuleResponse[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly savingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly selectedTab = signal<MenuLibraryTabId>('choices');

  readonly tabs: MenuLibraryTab[] = [
    {
      id: 'choices',
      labelKey: 'adminMenuLibrary.tabs.choices',
      helpKey: 'adminMenuLibrary.tabsHelp.choices',
      icon: 'options-outline',
    },
    {
      id: 'offers',
      labelKey: 'adminMenuLibrary.tabs.offers',
      helpKey: 'adminMenuLibrary.tabsHelp.offers',
      icon: 'pricetag-outline',
    },
    {
      id: 'availability',
      labelKey: 'adminMenuLibrary.tabs.availability',
      helpKey: 'adminMenuLibrary.tabsHelp.availability',
      icon: 'time-outline',
    },
  ];

  readonly loading = this.loadingSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly choices = this.choicesSignal.asReadonly();
  readonly rules = this.rulesSignal.asReadonly();

  readonly offers = computed(() =>
    this.rulesSignal().filter((rule) =>
      OFFER_RULE_TYPES.includes(rule.type as MenuLibraryRuleType)
    )
  );

  readonly availabilityRules = computed(() =>
    this.rulesSignal().filter((rule) =>
      AVAILABILITY_RULE_TYPES.includes(rule.type as MenuLibraryRuleType)
    )
  );

  readonly activeTab = computed(() =>
    this.tabs.find((tab) => tab.id === this.selectedTab()) ?? this.tabs[0]
  );

  readonly counts = computed<Record<MenuLibraryTabId, number>>(() => ({
    choices: this.choicesSignal().length,
    offers: this.offers().length,
    availability: this.availabilityRules().length,
  }));

  readonly cards = computed<MenuLibraryCard[]>(() => {
    switch (this.selectedTab()) {
      case 'choices':
        return this.choicesSignal().map((choice) =>
          this.mapChoiceToCard(choice)
        );

      case 'offers':
        return this.offers().map((rule) =>
          this.mapRuleToCard(rule, 'offer')
        );

      case 'availability':
        return this.availabilityRules().map((rule) =>
          this.mapRuleToCard(rule, 'availability')
        );
    }
  });

  async load(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const [choices, rules] = await Promise.all([
        firstValueFrom(this.api.getChoices()),
        firstValueFrom(this.api.getRules()),
      ]);

      this.choicesSignal.set(choices);
      this.rulesSignal.set(rules);
    } catch (error) {
      console.error(error);
      this.errorSignal.set('adminMenuLibrary.errors.loadFailed');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  selectTab(tabId: string | number | null | undefined): void {
    if (
      tabId === 'choices' ||
      tabId === 'offers' ||
      tabId === 'availability'
    ) {
      this.selectedTab.set(tabId);
    }
  }

  findChoiceById(choiceId: string): OptionGroupLibraryItem | null {
    return this.choicesSignal().find((choice) => choice.id === choiceId) ?? null;
  }

  findRuleById(ruleId: string): RestaurantRuleResponse | null {
    return this.rulesSignal().find((rule) => rule.id === ruleId) ?? null;
  }

  async saveChoice(result: ChoiceEditorResult): Promise<void> {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const request = this.mapChoiceResultToRequest(result);
      const savedChoice = result.id
        ? await firstValueFrom(this.api.updateChoice(result.id, request))
        : await firstValueFrom(this.api.createChoice(request));

      this.upsertChoice(savedChoice);
    } catch (error) {
      console.error(error);
      this.errorSignal.set('adminMenuLibrary.errors.saveChoiceFailed');
    } finally {
      this.savingSignal.set(false);
    }
  }

  async saveOffer(result: OfferEditorResult): Promise<void> {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const savedRule = result.id
        ? await firstValueFrom(
            this.api.updateRule(result.id, this.mapOfferToUpdateRequest(result))
          )
        : await firstValueFrom(
            this.api.createRule(this.mapOfferToCreateRequest(result))
          );

      this.upsertRule(savedRule);
    } catch (error) {
      console.error(error);
      this.errorSignal.set('adminMenuLibrary.errors.saveOfferFailed');
    } finally {
      this.savingSignal.set(false);
    }
  }

  async saveAvailability(result: AvailabilityEditorResult): Promise<void> {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const savedRule = result.id
        ? await firstValueFrom(
            this.api.updateRule(
              result.id,
              this.mapAvailabilityToUpdateRequest(result)
            )
          )
        : await firstValueFrom(
            this.api.createRule(this.mapAvailabilityToCreateRequest(result))
          );

      this.upsertRule(savedRule);
    } catch (error) {
      console.error(error);
      this.errorSignal.set('adminMenuLibrary.errors.saveAvailabilityFailed');
    } finally {
      this.savingSignal.set(false);
    }
  }

  private upsertChoice(choice: OptionGroupLibraryItem): void {
    const choices = this.choicesSignal();
    const exists = choices.some((currentChoice) => currentChoice.id === choice.id);

    this.choicesSignal.set(
      exists
        ? choices.map((currentChoice) =>
            currentChoice.id === choice.id ? choice : currentChoice
          )
        : [...choices, choice]
    );
  }

  private upsertRule(rule: RestaurantRuleResponse): void {
    const rules = this.rulesSignal();
    const exists = rules.some((currentRule) => currentRule.id === rule.id);

    this.rulesSignal.set(
      exists
        ? rules.map((currentRule) =>
            currentRule.id === rule.id ? rule : currentRule
          )
        : [...rules, rule]
    );
  }

  private mapChoiceResultToRequest(
    result: ChoiceEditorResult
  ): OptionGroupAdminRequest {
    return {
      name: result.name,
      description: result.description,
      required: result.required,
      minSelections: result.minSelections,
      maxSelections: result.maxSelections,
      items: result.items.map((item, index) => ({
        id: item.optionItemId,
        optionItemId: item.optionItemId,
        name: item.name,
        priceDelta: item.priceDelta ?? 0,
        isAvailable: item.isAvailable,
        displayOrder: index,
      })),
    };
  }

  private mapOfferToCreateRequest(
    result: OfferEditorResult
  ): RestaurantRuleCreateRequest {
    return this.mapOfferToRequest(result) as RestaurantRuleCreateRequest;
  }

  private mapOfferToUpdateRequest(
    result: OfferEditorResult
  ): RestaurantRuleUpdateRequest {
    return this.mapOfferToRequest(result) as RestaurantRuleUpdateRequest;
  }

  private mapOfferToRequest(result: OfferEditorResult) {
    return {
      name: result.name,
      description: result.description,
      type: result.type,
      active: result.active,
      favorite: result.favorite,
      reusable: true,
      customerVisible: result.customerVisible,
      customerTitle: result.customerTitle,
      customerDescription: result.customerDescription,
      tags: result.tags,
      condition: {
        timeFrom: result.timeFrom,
        timeTo: result.timeTo,
        daysOfWeek: [],
      },
      action: {
        priceDeltaOverride:
          result.type === 'PRICE_RULE'
            ? result.priceDeltaOverride ?? 0
            : undefined,
        includedSelections:
          result.type === 'INCLUDED_OPTION'
            ? result.includedSelections ?? 1
            : undefined,
        minSelections:
          result.type === 'SELECTION_RULE'
            ? result.minSelections ?? 0
            : undefined,
        maxSelections:
          result.type === 'SELECTION_RULE'
            ? result.maxSelections ?? 1
            : undefined,
      },
    };
  }

  private mapAvailabilityToCreateRequest(
    result: AvailabilityEditorResult
  ): RestaurantRuleCreateRequest {
    return this.mapAvailabilityToRequest(result) as RestaurantRuleCreateRequest;
  }

  private mapAvailabilityToUpdateRequest(
    result: AvailabilityEditorResult
  ): RestaurantRuleUpdateRequest {
    return this.mapAvailabilityToRequest(result) as RestaurantRuleUpdateRequest;
  }

  private mapAvailabilityToRequest(result: AvailabilityEditorResult) {
    return {
      name: result.name,
      description: result.description,
      type: result.type,
      active: result.active,
      favorite: result.favorite,
      reusable: true,
      customerVisible: result.customerVisible,
      customerTitle: result.customerTitle,
      customerDescription: result.customerDescription,
      tags: result.tags,
      condition: {
        daysOfWeek: result.daysOfWeek,
        timeFrom: result.timeFrom,
        timeTo: result.timeTo,
        orderType: result.orderType,
      },
      action: {
        available:
          result.type === 'AVAILABILITY'
            ? result.available ?? true
            : undefined,
        visible:
          result.type === 'VISIBILITY'
            ? result.visible ?? true
            : undefined,
      },
    };
  }

  private mapChoiceToCard(choice: OptionGroupLibraryItem): MenuLibraryCard {
    return {
      id: choice.id,
      kind: 'choice',
      title: choice.name,
      description: choice.description,
      badgeKey: 'adminMenuLibrary.badges.choice',
      metadata: [
        {
          labelKey: 'adminMenuLibrary.metadata.options',
          value: choice.items?.length ?? 0,
        },
      ],
      tags: [],
    };
  }

  private mapRuleToCard(
    rule: RestaurantRuleResponse,
    kind: 'offer' | 'availability'
  ): MenuLibraryCard {
    return {
      id: rule.id,
      kind,
      title: rule.name,
      description: rule.description,
      badgeKey:
        kind === 'offer'
          ? 'adminMenuLibrary.badges.offer'
          : 'adminMenuLibrary.badges.availability',
      metadata: this.buildRuleMetadata(rule),
      tags: rule.tags?.map((tag) => tag.name) ?? [],
      disabled: !rule.active,
    };
  }

  private buildRuleMetadata(
    rule: RestaurantRuleResponse
  ): MenuLibraryCardMetadata[] {
    const metadata: MenuLibraryCardMetadata[] = [
      {
        labelKey: 'adminMenuLibrary.metadata.type',
        value: this.ruleTypeLabelKey(rule.type as MenuLibraryRuleType),
      },
    ];

    if (rule.condition?.timeFrom || rule.condition?.timeTo) {
      metadata.push({
        labelKey: 'adminMenuLibrary.metadata.time',
        value: `${rule.condition.timeFrom ?? '—'} - ${rule.condition.timeTo ?? '—'}`,
      });
    }

    if (rule.condition?.daysOfWeek?.length) {
      metadata.push({
        labelKey: 'adminMenuLibrary.metadata.days',
        value: rule.condition.daysOfWeek.length,
      });
    }

    return metadata;
  }

  private ruleTypeLabelKey(type: MenuLibraryRuleType): string {
    switch (type) {
      case 'AVAILABILITY':
        return 'adminMenuLibrary.ruleTypes.availability';

      case 'VISIBILITY':
        return 'adminMenuLibrary.ruleTypes.visibility';

      case 'SELECTION_RULE':
        return 'adminMenuLibrary.ruleTypes.selection';

      case 'INCLUDED_OPTION':
        return 'adminMenuLibrary.ruleTypes.includedOption';

      case 'PRICE_RULE':
        return 'adminMenuLibrary.ruleTypes.price';
    }
  }
}
