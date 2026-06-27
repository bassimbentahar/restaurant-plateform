import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeOutline } from 'ionicons/icons';

import {
  OfferEditorResult,
  OfferEditorType,
} from '../../data-access/menu-library.model';
import { RestaurantRuleResponse } from '../../../rule/dto/rule-admin.dto';

@Component({
  selector: 'app-offer-editor-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './offer-editor-modal.component.html',
  styleUrls: ['./offer-editor-modal.component.scss'],
})
export class OfferEditorModalComponent implements OnInit {
  @Input() rule: RestaurantRuleResponse | null = null;
  @Input() duplicate = false;

  readonly name = signal('');
  readonly description = signal('');
  readonly type = signal<OfferEditorType>('PRICE_RULE');
  readonly active = signal(true);
  readonly favorite = signal(false);
  readonly customerVisible = signal(false);
  readonly customerTitle = signal('');
  readonly customerDescription = signal('');
  readonly tags = signal('');
  readonly timeFrom = signal('');
  readonly timeTo = signal('');
  readonly priceDeltaOverride = signal<number | null>(0);
  readonly includedSelections = signal<number | null>(1);
  readonly minSelections = signal<number | null>(0);
  readonly maxSelections = signal<number | null>(1);
  readonly submitted = signal(false);

  readonly isValid = computed(() => this.name().trim().length > 0);

  constructor(private readonly modalController: ModalController) {
    addIcons({
      checkmarkCircleOutline,
      closeOutline,
    });
  }

  ngOnInit(): void {
    if (!this.rule) {
      return;
    }

    this.name.set(this.duplicate ? `${this.rule.name} - copie` : this.rule.name);
    this.description.set(this.rule.description ?? '');
    this.type.set(this.normalizeType(this.rule.type));
    this.active.set(this.rule.active);
    this.favorite.set(this.rule.favorite);
    this.customerVisible.set(this.rule.customerVisible);
    this.customerTitle.set(this.rule.customerTitle ?? '');
    this.customerDescription.set(this.rule.customerDescription ?? '');
    this.tags.set((this.rule.tags ?? []).map((tag) => tag.name).join(', '));
    this.timeFrom.set(this.rule.condition?.timeFrom ?? '');
    this.timeTo.set(this.rule.condition?.timeTo ?? '');
    this.priceDeltaOverride.set(this.rule.action?.priceDeltaOverride ?? 0);
    this.includedSelections.set(this.rule.action?.includedSelections ?? 1);
    this.minSelections.set(this.rule.action?.minSelections ?? 0);
    this.maxSelections.set(this.rule.action?.maxSelections ?? 1);
  }

  updateName(value: string | number | null | undefined): void {
    this.name.set(String(value ?? ''));
  }

  updateDescription(value: string | number | null | undefined): void {
    this.description.set(String(value ?? ''));
  }

  updateType(value: string | number | null | undefined): void {
    this.type.set(this.normalizeType(String(value ?? 'PRICE_RULE')));
  }

  updateTags(value: string | number | null | undefined): void {
    this.tags.set(String(value ?? ''));
  }

  updateTimeFrom(value: string | number | null | undefined): void {
    this.timeFrom.set(String(value ?? ''));
  }

  updateTimeTo(value: string | number | null | undefined): void {
    this.timeTo.set(String(value ?? ''));
  }

  updatePriceDelta(value: string | number | null | undefined): void {
    this.priceDeltaOverride.set(this.toMoney(value, 0));
  }

  updateIncludedSelections(value: string | number | null | undefined): void {
    this.includedSelections.set(this.toPositiveInteger(value, 1));
  }

  updateMinSelections(value: string | number | null | undefined): void {
    this.minSelections.set(this.toPositiveInteger(value, 0));
  }

  updateMaxSelections(value: string | number | null | undefined): void {
    this.maxSelections.set(this.toPositiveInteger(value, 1));
  }

  save(): void {
    this.submitted.set(true);

    if (!this.isValid()) {
      return;
    }

    const result: OfferEditorResult = {
      id: this.duplicate ? undefined : this.rule?.id,
      name: this.name().trim(),
      description: this.toOptionalText(this.description()),
      type: this.type(),
      active: this.active(),
      favorite: this.favorite(),
      customerVisible: this.customerVisible(),
      customerTitle: this.toOptionalText(this.customerTitle()),
      customerDescription: this.toOptionalText(this.customerDescription()),
      tags: this.toTags(this.tags()),
      timeFrom: this.toOptionalText(this.timeFrom()),
      timeTo: this.toOptionalText(this.timeTo()),
      priceDeltaOverride: this.priceDeltaOverride() ?? 0,
      includedSelections: this.includedSelections() ?? 1,
      minSelections: this.minSelections() ?? 0,
      maxSelections: this.maxSelections() ?? 1,
    };

    this.modalController.dismiss(result, 'saved');
  }

  close(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  private normalizeType(type: string): OfferEditorType {
    if (
      type === 'PRICE_RULE' ||
      type === 'INCLUDED_OPTION' ||
      type === 'SELECTION_RULE'
    ) {
      return type;
    }

    return 'PRICE_RULE';
  }

  private toMoney(value: string | number | null | undefined, fallback: number): number {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    const parsed = Number(String(value).replace(',', '.'));

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.round(parsed * 100) / 100;
  }

  private toPositiveInteger(value: string | number | null | undefined, fallback: number): number {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.max(0, Math.floor(parsed));
  }

  private toOptionalText(value: string): string | undefined {
    const cleaned = value.trim();
    return cleaned ? cleaned : undefined;
  }

  private toTags(value: string): string[] {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
}
