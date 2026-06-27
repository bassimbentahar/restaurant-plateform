import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonToggle,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

import {
  OptionGroupLibraryItem,
  ProductChoiceDraft,
  ProductChoiceItemDraft,
} from '../../state/product-editor.model';

type ChoiceValueChange<TValue> = {
  choiceId: string;
  value: TValue;
};

type ChoiceItemValueChange<TValue> = {
  choiceId: string;
  itemId: string;
  value: TValue;
};

type ChoiceItemAction = {
  choiceId: string;
  itemId: string;
};

type ChoiceItemVisibilityChange = {
  choiceId: string;
  itemId: string;
  visible: boolean;
};

@Component({
  selector: 'app-choices-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonBadge,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonToggle,
  ],
  templateUrl: './choices-step.component.html',
  styleUrls: ['./choices-step.component.scss'],
})
export class ChoicesStepComponent {
  readonly choices = input.required<ProductChoiceDraft[]>();
  readonly availableLibraryChoices = input<OptionGroupLibraryItem[]>([]);

  readonly openLibrary = output<void>();
  readonly createCustomChoice = output<void>();

  readonly configureChoice = output<ProductChoiceDraft>();
  readonly adaptChoiceByFormat = output<string>();
  readonly duplicateLibraryChoiceAsCustom = output<string>();
  readonly removeChoice = output<string>();

  readonly choiceNameChange = output<ChoiceValueChange<string>>();
  readonly choiceRequiredChange = output<ChoiceValueChange<boolean>>();
  readonly choiceMinSelectionsChange = output<ChoiceValueChange<number>>();
  readonly choiceMaxSelectionsChange = output<ChoiceValueChange<number>>();

  readonly addChoiceItem = output<string>();
  readonly itemNameChange = output<ChoiceItemValueChange<string>>();
  readonly itemPriceDeltaChange = output<ChoiceItemValueChange<number>>();
  readonly itemAvailableChange = output<ChoiceItemValueChange<boolean>>();
  readonly itemVisibilityChange = output<ChoiceItemVisibilityChange>();
  readonly removeChoiceItem = output<ChoiceItemAction>();

  readonly totalOptionsCount = computed(() =>
    this.choices().reduce((total, choice) => total + choice.items.length, 0)
  );

  readonly libraryChoicesCount = computed(() =>
    this.choices().filter((choice) => choice.source === 'library').length
  );

  readonly customChoicesCount = computed(() =>
    this.choices().filter((choice) => choice.source === 'custom').length
  );

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  emitChoiceNameChange(
    choiceId: string,
    value: string | number | null | undefined
  ): void {
    this.choiceNameChange.emit({
      choiceId,
      value: this.toText(value),
    });
  }

  emitChoiceMinSelectionsChange(
    choiceId: string,
    value: string | number | null | undefined
  ): void {
    this.choiceMinSelectionsChange.emit({
      choiceId,
      value: this.toInteger(value),
    });
  }

  emitChoiceMaxSelectionsChange(
    choiceId: string,
    value: string | number | null | undefined
  ): void {
    this.choiceMaxSelectionsChange.emit({
      choiceId,
      value: this.toInteger(value),
    });
  }

  emitItemNameChange(
    choiceId: string,
    itemId: string,
    value: string | number | null | undefined
  ): void {
    this.itemNameChange.emit({
      choiceId,
      itemId,
      value: this.toText(value),
    });
  }

  emitItemPriceDeltaChange(
    choiceId: string,
    itemId: string,
    value: string | number | null | undefined
  ): void {
    this.itemPriceDeltaChange.emit({
      choiceId,
      itemId,
      value: this.toMoney(value),
    });
  }

  isChoiceMinGreaterThanMax(choice: ProductChoiceDraft): boolean {
    return choice.minSelections > choice.maxSelections;
  }

  isChoiceMaxGreaterThanVisibleOptions(choice: ProductChoiceDraft): boolean {
    return choice.maxSelections > this.getVisibleChoiceItemCount(choice);
  }

  getVisibleChoiceItemCount(choice: ProductChoiceDraft): number {
    return choice.items.filter((item) => this.isChoiceItemVisible(choice, item)).length;
  }

  isChoiceItemVisible(
    choice: ProductChoiceDraft,
    item: ProductChoiceItemDraft
  ): boolean {
    const key = this.getChoiceItemOverrideKey(item);

    return choice.itemOverrides[key]?.visible ?? item.isAvailable;
  }

  getChoiceSourceLabelKey(choice: ProductChoiceDraft): string {
    return choice.source === 'library'
      ? 'adminProductWizard.choices.library.sourceLibrary'
      : 'adminProductWizard.choices.library.sourceCustom';
  }

  getChoiceSourceHelpKey(choice: ProductChoiceDraft): string {
    return choice.source === 'library'
      ? 'adminProductWizard.choicesPremium.sourceLibraryHelp'
      : 'adminProductWizard.choicesPremium.sourceCustomHelp';
  }

  getChoiceItemOverrideKey(item: ProductChoiceItemDraft): string {
    return item.optionItemId ?? item.id;
  }

  private toText(value: string | number | null | undefined): string {
    return String(value ?? '').trim();
  }

  private toInteger(value: string | number | null | undefined): number {
    const parsed = Number(value ?? 0);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.max(0, Math.trunc(parsed));
  }

  private toMoney(value: string | number | null | undefined): number {
    const parsed = Number(value ?? 0);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.round(parsed * 100) / 100;
  }
}
