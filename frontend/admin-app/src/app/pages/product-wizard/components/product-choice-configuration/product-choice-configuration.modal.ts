import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToggle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeOutline } from 'ionicons/icons';

import {
  OptionGroupLibraryItem,
  ProductChoiceProductConfiguration,
} from '../../state/product-editor.model';

const REQUIRED_MIN_VALIDATION_KEY =
  'adminProductWizard.choiceConfiguration.validation.requiredMin';

const REQUIRED_MAX_VALIDATION_KEY =
  'adminProductWizard.choiceConfiguration.validation.requiredMax';

const MAX_OPTIONS_VALIDATION_KEY =
  'adminProductWizard.choiceConfiguration.validation.maxGreaterThanAvailableOptions';

@Component({
  selector: 'app-product-choice-configuration-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    TranslatePipe,
  ],
  templateUrl: './product-choice-configuration.modal.html',
  styleUrl: './product-choice-configuration.modal.scss',
})
export class ProductChoiceConfigurationModal implements OnInit {
  @Input({ required: true }) choice!: OptionGroupLibraryItem;
  @Input() nextDisplayOrder = 0;

  readonly required = signal(false);

  /**
   * Null means the user temporarily cleared the input while editing.
   * We normalize the value on blur.
   */
  readonly minSelections = signal<number | null>(0);
  readonly maxSelections = signal<number | null>(1);
  readonly displayOrder = signal<number | null>(0);

  readonly minSelectionMessageKey = signal<string | null>(null);
  readonly maxSelectionMessageKey = signal<string | null>(null);

  readonly availableOptionCount = computed(() => this.choice.items.length);

  readonly isMinGreaterThanMax = computed(() => {
    const min = this.minSelections();
    const max = this.maxSelections();

    if (min === null || max === null) {
      return false;
    }

    return min > max;
  });

  readonly isValid = computed(() => {
    const min = this.minSelections();
    const max = this.maxSelections();
    const order = this.displayOrder();
    const availableOptionCount = this.availableOptionCount();

    if (min === null || max === null || order === null) {
      return false;
    }

    return (
      min >= 0 &&
      max >= 0 &&
      order >= 0 &&
      min <= max &&
      max <= availableOptionCount &&
      (!this.required() || min >= 1) &&
      (!this.required() || max >= 1)
    );
  });

  constructor(private readonly modalController: ModalController) {
    addIcons({
      checkmarkCircleOutline,
      closeOutline,
    });
  }

  ngOnInit(): void {
    this.required.set(this.choice.required);

    this.minSelections.set(
      this.normalizeInitialSelection(this.choice.minSelections, 0)
    );

    this.maxSelections.set(
      this.normalizeInitialSelection(this.choice.maxSelections, 1)
    );

    this.displayOrder.set(
      this.toPositiveInteger(this.nextDisplayOrder, 0)
    );

    this.normalizeRequiredBounds();
    this.normalizeMaxWithAvailableOptions();
  }

  updateRequired(value: boolean): void {
    this.required.set(value);

    this.minSelectionMessageKey.set(null);
    this.maxSelectionMessageKey.set(null);

    this.normalizeRequiredBounds();
  }

  updateMinSelections(value: string | number | null | undefined): void {
    if (this.isEmptyInput(value)) {
      this.minSelections.set(null);
      this.minSelectionMessageKey.set(null);
      return;
    }

    const min = this.toPositiveInteger(value, 0);

    if (this.required() && min < 1) {
      this.minSelections.set(1);
      this.minSelectionMessageKey.set(REQUIRED_MIN_VALIDATION_KEY);
      return;
    }

    this.minSelections.set(min);
    this.minSelectionMessageKey.set(null);
  }

  updateMaxSelections(value: string | number | null | undefined): void {
    if (this.isEmptyInput(value)) {
      this.maxSelections.set(null);
      this.maxSelectionMessageKey.set(null);
      return;
    }

    const max = this.toPositiveInteger(value, 0);
    const availableOptionCount = this.availableOptionCount();

    if (this.required() && max < 1) {
      this.maxSelections.set(1);
      this.maxSelectionMessageKey.set(REQUIRED_MAX_VALIDATION_KEY);
      return;
    }

    if (max > availableOptionCount) {
      this.maxSelections.set(availableOptionCount);
      this.maxSelectionMessageKey.set(MAX_OPTIONS_VALIDATION_KEY);
      return;
    }

    this.maxSelections.set(max);
    this.maxSelectionMessageKey.set(null);
  }

  updateDisplayOrder(value: string | number | null | undefined): void {
    if (this.isEmptyInput(value)) {
      this.displayOrder.set(null);
      return;
    }

    this.displayOrder.set(this.toPositiveInteger(value, 0));
  }

  normalizeMinSelectionsOnBlur(): void {
    if (this.minSelections() === null) {
      this.minSelections.set(this.required() ? 1 : 0);
    }
  }

  normalizeMaxSelectionsOnBlur(): void {
    if (this.maxSelections() === null) {
      this.maxSelections.set(this.required() ? 1 : 0);
    }

    this.normalizeMaxWithAvailableOptions();
  }

  normalizeDisplayOrderOnBlur(): void {
    if (this.displayOrder() === null) {
      this.displayOrder.set(0);
    }
  }

  private normalizeMaxWithAvailableOptions(): void {
    const max = this.maxSelections();
    const availableOptionCount = this.availableOptionCount();

    if (max !== null && max > availableOptionCount) {
      this.maxSelections.set(availableOptionCount);
    }
  }

  blockInvalidNumberKeys(event: KeyboardEvent): void {
    const allowedControlKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];

    if (allowedControlKeys.includes(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  confirm(): void {
    if (!this.isValid()) {
      return;
    }

    const configuration: ProductChoiceProductConfiguration = {
      required: this.required(),
      minSelections: this.minSelections() ?? 0,
      maxSelections: this.maxSelections() ?? 0,
      displayOrder: this.displayOrder() ?? 0,
    };

    this.modalController.dismiss(configuration, 'configured');
  }

  close(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  private normalizeRequiredBounds(): void {
    const min = this.minSelections();
    const max = this.maxSelections();

    if (this.required() && (min === null || min < 1)) {
      this.minSelections.set(1);
    }

    if (this.required() && (max === null || max < 1)) {
      this.maxSelections.set(1);
    }
  }

  private normalizeInitialSelection(value: number, fallback: number): number {
    const normalized = this.toPositiveInteger(value, fallback);

    if (this.required() && normalized < 1) {
      return 1;
    }

    return normalized;
  }

  private isEmptyInput(value: string | number | null | undefined): boolean {
    return value === null || value === undefined || value === '';
  }

  private toPositiveInteger(
    value: string | number | null | undefined,
    fallback: number
  ): number {
    if (this.isEmptyInput(value)) {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.max(0, Math.floor(parsed));
  }
}
