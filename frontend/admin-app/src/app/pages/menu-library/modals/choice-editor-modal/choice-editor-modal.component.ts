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
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  trashOutline,
  warningOutline,
} from 'ionicons/icons';

import {
  ChoiceEditorMode,
  ChoiceEditorOptionDraft,
  ChoiceEditorResult,
} from '../../data-access/menu-library.model';
import { OptionGroupLibraryItem } from '../../../product-wizard/state/product-editor.model';

const REQUIRED_MIN_VALIDATION_KEY =
  'adminMenuLibrary.choiceEditor.validation.requiredMin';

const REQUIRED_MAX_VALIDATION_KEY =
  'adminMenuLibrary.choiceEditor.validation.requiredMax';

const MIN_GREATER_THAN_MAX_VALIDATION_KEY =
  'adminMenuLibrary.choiceEditor.validation.minGreaterThanMax';

const MAX_OPTIONS_VALIDATION_KEY =
  'adminMenuLibrary.choiceEditor.validation.maxGreaterThanAvailableOptions';

const NAME_REQUIRED_VALIDATION_KEY =
  'adminMenuLibrary.choiceEditor.validation.nameRequired';

const OPTIONS_REQUIRED_VALIDATION_KEY =
  'adminMenuLibrary.choiceEditor.validation.optionsRequired';

const OPTION_NAME_REQUIRED_VALIDATION_KEY =
  'adminMenuLibrary.choiceEditor.validation.optionNameRequired';

@Component({
  selector: 'app-choice-editor-modal',
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
    IonFooter,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    TranslatePipe,
  ],
  templateUrl: './choice-editor-modal.component.html',
  styleUrls: ['./choice-editor-modal.component.scss'],
})
export class ChoiceEditorModalComponent implements OnInit {
  @Input() choice: OptionGroupLibraryItem | null = null;
  @Input() mode: ChoiceEditorMode = 'create';

  readonly name = signal('');
  readonly description = signal('');
  readonly required = signal(false);
  readonly minSelections = signal<number | null>(0);
  readonly maxSelections = signal<number | null>(0);
  readonly items = signal<ChoiceEditorOptionDraft[]>([]);
  readonly nameMessageKey = signal<string | null>(null);
  readonly optionsMessageKey = signal<string | null>(null);
  readonly minSelectionMessageKey = signal<string | null>(null);
  readonly maxSelectionMessageKey = signal<string | null>(null);
  readonly itemMessageKeys = signal<Record<string, string | null>>({});
  readonly maxTouched = signal(false);
  readonly minTouched = signal(false);
  readonly submitted = signal(false);

  readonly availableOptionCount = computed(() =>
    this.items().filter((item) => item.isAvailable).length
  );

  readonly isMinGreaterThanMax = computed(() => {
    const min = this.minSelections();
    const max = this.maxSelections();

    return min !== null && max !== null && min > max;
  });

  readonly shouldShowMinMaxError = computed(() =>
    this.isMinGreaterThanMax() &&
    (this.minTouched() || this.maxTouched() || this.submitted())
  );

  readonly isValid = computed(() => {
    const min = this.minSelections();
    const max = this.maxSelections();
    const options = this.items();
    const availableOptionCount = this.availableOptionCount();

    if (!this.name().trim()) {
      return false;
    }

    if (options.length === 0) {
      return false;
    }

    if (options.some((item) => !item.name.trim())) {
      return false;
    }

    if (min === null || max === null) {
      return false;
    }

    return (
      min >= 0 &&
      max >= 0 &&
      min <= max &&
      max <= availableOptionCount &&
      (!this.required() || min >= 1) &&
      (!this.required() || max >= 1)
    );
  });

  constructor(private readonly modalController: ModalController) {
    addIcons({
      addCircleOutline,
      checkmarkCircleOutline,
      closeOutline,
      trashOutline,
      warningOutline,
    });
  }

  ngOnInit(): void {
    const initialItems = this.createInitialItems();

    this.items.set(initialItems);
    this.name.set(this.resolveInitialName());
    this.description.set(this.choice?.description ?? '');
    this.required.set(Boolean(this.choice?.required));

    const defaultMax = initialItems.length > 0 ? 1 : 0;

    this.minSelections.set(
      this.normalizeInitialSelection(this.choice?.minSelections ?? 0, 0)
    );

    this.maxSelections.set(
      this.normalizeInitialSelection(this.choice?.maxSelections ?? defaultMax, defaultMax)
    );

    this.normalizeRequiredBounds(false);
    this.normalizeMaxWithAvailableOptions(false);
    this.clearSelectionMessagesIfValid();
  }

  updateName(value: string | number | null | undefined): void {
    this.name.set(String(value ?? ''));

    if (String(value ?? '').trim()) {
      this.nameMessageKey.set(null);
    }
  }

  updateDescription(value: string | number | null | undefined): void {
    this.description.set(String(value ?? ''));
  }

  updateRequired(value: boolean): void {
    this.required.set(value);
    this.minTouched.set(true);
    this.maxTouched.set(true);
    this.minSelectionMessageKey.set(null);
    this.maxSelectionMessageKey.set(null);
    this.normalizeRequiredBounds(true);
    this.normalizeMaxWithAvailableOptions(true);
    this.clearSelectionMessagesIfValid();
  }

  updateMinSelections(value: string | number | null | undefined): void {
    this.minTouched.set(true);

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
    this.clearSelectionMessagesIfValid();
  }

  updateMaxSelections(value: string | number | null | undefined): void {
    this.maxTouched.set(true);

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
    this.clearSelectionMessagesIfValid();
  }

  normalizeMinSelectionsOnBlur(): void {
    if (this.minSelections() === null) {
      this.minSelections.set(this.required() ? 1 : 0);
    }

    this.validateMinMax(true);
    this.clearSelectionMessagesIfValid();
  }

  normalizeMaxSelectionsOnBlur(): void {
    if (this.maxSelections() === null) {
      this.maxSelections.set(this.required() ? 1 : 0);
    }

    this.normalizeMaxWithAvailableOptions(true);
    this.validateMinMax(true);
    this.clearSelectionMessagesIfValid();
  }

  addOption(): void {
    const options = this.items();

    this.items.set([
      ...options,
      {
        id: this.createClientId(),
        name: '',
        priceDelta: 0,
        isAvailable: true,
        displayOrder: options.length,
      },
    ]);

    this.optionsMessageKey.set(null);

    if (this.maxSelections() === 0 && this.availableOptionCount() > 0) {
      this.maxSelections.set(1);
    }

    this.normalizeMaxWithAvailableOptions(false);
    this.clearSelectionMessagesIfValid();
  }

  removeOption(optionId: string): void {
    const nextItems = this.items()
      .filter((item) => item.id !== optionId)
      .map((item, index) => ({
        ...item,
        displayOrder: index,
      }));

    this.items.set(nextItems);
    this.removeItemMessage(optionId);
    this.normalizeMaxWithAvailableOptions(true);
    this.validateOptions();
    this.clearSelectionMessagesIfValid();
  }

  updateOptionName(
    optionId: string,
    value: string | number | null | undefined
  ): void {
    const name = String(value ?? '');

    this.updateOption(optionId, { name });

    if (name.trim()) {
      this.setItemMessage(optionId, null);
    }
  }

  updateOptionPriceDelta(
    optionId: string,
    value: string | number | null | undefined
  ): void {
    if (this.isEmptyInput(value)) {
      this.updateOption(optionId, { priceDelta: null });
      return;
    }

    this.updateOption(optionId, {
      priceDelta: this.toPositiveMoney(value, 0),
    });
  }

  normalizeOptionPriceDeltaOnBlur(optionId: string): void {
    const option = this.items().find((item) => item.id === optionId);

    if (!option || option.priceDelta !== null) {
      return;
    }

    this.updateOption(optionId, { priceDelta: 0 });
  }

  updateOptionAvailable(optionId: string, isAvailable: boolean): void {
    this.updateOption(optionId, { isAvailable });
    this.normalizeMaxWithAvailableOptions(true);
    this.clearSelectionMessagesIfValid();
  }

  blockInvalidIntegerKeys(event: KeyboardEvent): void {
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

    if (allowedControlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  blockInvalidMoneyKeys(event: KeyboardEvent): void {
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

    if (allowedControlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(event.key) && event.key !== '.' && event.key !== ',') {
      event.preventDefault();
    }
  }

  confirm(): void {
    this.submitted.set(true);
    this.validateBeforeConfirm();

    if (!this.isValid()) {
      return;
    }

    const result: ChoiceEditorResult = {
      id: this.mode === 'edit' ? this.choice?.id : undefined,
      name: this.name().trim(),
      description: this.toOptionalText(this.description()),
      required: this.required(),
      minSelections: this.minSelections() ?? 0,
      maxSelections: this.maxSelections() ?? 0,
      items: this.items().map((item, index) => ({
        ...item,
        name: item.name.trim(),
        priceDelta: item.priceDelta ?? 0,
        displayOrder: index,
      })),
    };

    this.modalController.dismiss(result, 'saved');
  }

  close(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  private validateBeforeConfirm(): void {
    this.nameMessageKey.set(
      this.name().trim() ? null : NAME_REQUIRED_VALIDATION_KEY
    );
    this.validateOptions();
    this.normalizeRequiredBounds(true);
    this.normalizeMaxWithAvailableOptions(true);
    this.validateMinMax(true);
    this.clearSelectionMessagesIfValid();
  }

  private validateOptions(): void {
    const options = this.items();

    this.optionsMessageKey.set(
      options.length > 0 ? null : OPTIONS_REQUIRED_VALIDATION_KEY
    );

    const messages: Record<string, string | null> = {};

    for (const option of options) {
      messages[option.id] = option.name.trim()
        ? null
        : OPTION_NAME_REQUIRED_VALIDATION_KEY;
    }

    this.itemMessageKeys.set(messages);
  }

  private validateMinMax(showMessage: boolean): void {
    if (this.isMinGreaterThanMax() && showMessage) {
      this.maxSelectionMessageKey.set(MIN_GREATER_THAN_MAX_VALIDATION_KEY);
    }
  }

  private normalizeRequiredBounds(showMessages: boolean): void {
    const min = this.minSelections();
    const max = this.maxSelections();

    if (this.required() && (min === null || min < 1)) {
      this.minSelections.set(1);

      if (showMessages) {
        this.minSelectionMessageKey.set(REQUIRED_MIN_VALIDATION_KEY);
      }
    }

    if (this.required() && (max === null || max < 1)) {
      this.maxSelections.set(1);

      if (showMessages) {
        this.maxSelectionMessageKey.set(REQUIRED_MAX_VALIDATION_KEY);
      }
    }
  }

  private normalizeMaxWithAvailableOptions(showMessage: boolean): void {
    const max = this.maxSelections();
    const availableOptionCount = this.availableOptionCount();

    if (max !== null && max > availableOptionCount) {
      this.maxSelections.set(availableOptionCount);

      if (showMessage) {
        this.maxSelectionMessageKey.set(MAX_OPTIONS_VALIDATION_KEY);
      }

      return;
    }

    if (this.maxSelectionMessageKey() === MAX_OPTIONS_VALIDATION_KEY) {
      this.maxSelectionMessageKey.set(null);
    }
  }

  private clearSelectionMessagesIfValid(): void {
    const min = this.minSelections();
    const max = this.maxSelections();

    if (min !== null && (!this.required() || min >= 1)) {
      if (this.minSelectionMessageKey() === REQUIRED_MIN_VALIDATION_KEY) {
        this.minSelectionMessageKey.set(null);
      }
    }

    if (
      max !== null &&
      max <= this.availableOptionCount() &&
      (!this.required() || max >= 1) &&
      !this.isMinGreaterThanMax()
    ) {
      this.maxSelectionMessageKey.set(null);
    }
  }

  private createInitialItems(): ChoiceEditorOptionDraft[] {
    return (this.choice?.items ?? []).map((item, index) => ({
      id: item.id ?? this.createClientId(),
      optionItemId: item.id,
      name: item.name,
      priceDelta: item.priceDelta ?? 0,
      isAvailable: item.isAvailable ?? true,
      displayOrder: index,
    }));
  }

  private resolveInitialName(): string {
    if (!this.choice) {
      return '';
    }

    if (this.mode !== 'duplicate') {
      return this.choice.name;
    }

    return `${this.choice.name} - copie`;
  }

  private updateOption(
    optionId: string,
    patch: Partial<ChoiceEditorOptionDraft>
  ): void {
    this.items.set(
      this.items().map((item) =>
        item.id === optionId
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  }

  private setItemMessage(optionId: string, messageKey: string | null): void {
    this.itemMessageKeys.set({
      ...this.itemMessageKeys(),
      [optionId]: messageKey,
    });
  }

  private removeItemMessage(optionId: string): void {
    const { [optionId]: _removed, ...messages } = this.itemMessageKeys();

    this.itemMessageKeys.set(messages);
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

  private toPositiveMoney(
    value: string | number | null | undefined,
    fallback: number
  ): number {
    if (this.isEmptyInput(value)) {
      return fallback;
    }

    const normalizedValue = String(value).replace(',', '.');
    const parsed = Number(normalizedValue);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.max(0, Math.round(parsed * 100) / 100);
  }

  private toOptionalText(value: string): string | undefined {
    const trimmedValue = value.trim();

    return trimmedValue ? trimmedValue : undefined;
  }

  private createClientId(): string {
    return `choice-option-${crypto.randomUUID()}`;
  }
}
