import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import {RestaurantRuleResponse} from '../dto/rule-admin.dto';
import {ProductRuleType} from '../../product-wizard/state/product-editor.model';



type RuleFilter =
  | {
  id: 'all';
  type: 'system';
  labelKey: string;
}
  | {
  id: 'favorites';
  type: 'system';
  labelKey: string;
}
  | {
  id: string;
  type: 'tag';
  label: string;
};

@Component({
  selector: 'app-rule-library-picker-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonBadge,
    IonSegment,
    IonSegmentButton,
  ],
  templateUrl: './rule-library-picker.modal.html',
  styleUrls: ['./rule-library-picker.modal.scss'],
})
export class RuleLibraryPickerModal {
  private readonly rulesSignal = signal<RestaurantRuleResponse[]>([]);

  @Input()
  set rules(value: RestaurantRuleResponse[] | null | undefined) {
    this.rulesSignal.set(value ?? []);
  }

  readonly selectedFilterId = signal<string>('all');
  readonly searchTerm = signal('');
  private readonly disabledRuleIdsSignal = signal<Set<string>>(new Set());

  @Input()
  set disabledRuleIds(value: string[] | null | undefined) {
    this.disabledRuleIdsSignal.set(new Set(value ?? []));
  }

  isDisabled(rule: RestaurantRuleResponse): boolean {
    return this.disabledRuleIdsSignal().has(rule.id);
  }
  readonly filters = computed<RuleFilter[]>(() => {
    const tagNames = new Map<string, string>();

    for (const rule of this.rulesSignal()) {
      for (const tag of rule.tags ?? []) {
        const normalizedName = this.normalize(tag.name);

        if (!normalizedName) {
          continue;
        }

        tagNames.set(normalizedName, tag.name);
      }
    }

    const dynamicTagFilters: RuleFilter[] = [...tagNames.entries()]
      .sort(([, firstName], [, secondName]) =>
        firstName.localeCompare(secondName)
      )
      .map(([normalizedName, originalName]) => ({
        id: `tag:${normalizedName}`,
        type: 'tag',
        label: originalName,
      }));

    return [
      {
        id: 'all',
        type: 'system',
        labelKey: 'adminProductWizard.conditions.libraryPicker.filters.all',
      },
      {
        id: 'favorites',
        type: 'system',
        labelKey: 'adminProductWizard.conditions.libraryPicker.filters.favorites',
      },
      ...dynamicTagFilters,
    ];
  });

  readonly filteredRules = computed(() => {
    const selectedFilterId = this.selectedFilterId();
    const search = this.normalize(this.searchTerm());

    return this.rulesSignal().filter((rule) => {
      const matchesFilter = this.matchesFilter(rule, selectedFilterId);
      const matchesSearch = !search || this.matchesSearch(rule, search);

      return matchesFilter && matchesSearch;
    });
  });

  constructor(private readonly modalController: ModalController) {}

  close(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  selectRule(rule: RestaurantRuleResponse): void {
    if (this.isDisabled(rule)) {
      return;
    }

    this.modalController.dismiss(rule, 'select');
  }

  updateFilter(value: string | number | null | undefined): void {
    const filterId = String(value ?? 'all');

    const exists = this.filters().some((filter) => filter.id === filterId);

    this.selectedFilterId.set(exists ? filterId : 'all');
  }

  updateSearch(value: string | number | null | undefined): void {
    this.searchTerm.set(String(value ?? ''));
  }

  ruleTypeLabelKey(type: ProductRuleType): string {
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

  private matchesFilter(
    rule: RestaurantRuleResponse,
    selectedFilterId: string
  ): boolean {
    if (selectedFilterId === 'all') {
      return true;
    }

    if (selectedFilterId === 'favorites') {
      return rule.favorite;
    }

    if (!selectedFilterId.startsWith('tag:')) {
      return true;
    }

    const selectedTagName = selectedFilterId.replace('tag:', '');

    return (rule.tags ?? []).some(
      (tag) => this.normalize(tag.name) === selectedTagName
    );
  }

  private matchesSearch(
    rule: RestaurantRuleResponse,
    search: string
  ): boolean {
    return (
      this.normalize(rule.name).includes(search) ||
      this.normalize(rule.description ?? '').includes(search) ||
      this.normalize(rule.type).includes(search) ||
      (rule.tags ?? []).some((tag) =>
        this.normalize(tag.name).includes(search)
      )
    );
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
