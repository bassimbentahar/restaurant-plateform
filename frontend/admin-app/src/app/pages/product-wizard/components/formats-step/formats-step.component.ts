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

import { ProductVariantDraft } from '../../state/product-editor.model';

type VariantValueChange<TValue> = {
  variantId: string;
  value: TValue;
};

@Component({
  selector: 'app-formats-step',
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
  templateUrl: './formats-step.component.html',
  styleUrls: ['./formats-step.component.scss'],
})
export class FormatsStepComponent {
  readonly variants = input.required<ProductVariantDraft[]>();
  readonly basePrice = input.required<number>();

  readonly addVariant = output<void>();
  readonly variantNameChange = output<VariantValueChange<string>>();
  readonly variantPriceAdjustmentChange = output<VariantValueChange<number>>();
  readonly setDefaultVariant = output<string>();
  readonly variantAvailableChange = output<VariantValueChange<boolean>>();
  readonly configureVariantChoices = output<string>();
  readonly removeVariant = output<string>();

  readonly availableVariantsCount = computed(() =>
    this.variants().filter((variant) => variant.isAvailable).length
  );

  readonly defaultVariant = computed(() =>
    this.variants().find((variant) => variant.isDefault) ?? this.variants()[0] ?? null
  );

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  getFinalPrice(variant: ProductVariantDraft): number {
    return this.basePrice() + variant.priceAdjustment;
  }

  canRemoveVariant(): boolean {
    return this.variants().length > 1;
  }

  emitVariantNameChange(
    variantId: string,
    value: string | number | null | undefined
  ): void {
    this.variantNameChange.emit({
      variantId,
      value: String(value ?? '').trim(),
    });
  }

  emitVariantPriceAdjustmentChange(
    variantId: string,
    value: string | number | null | undefined
  ): void {
    this.variantPriceAdjustmentChange.emit({
      variantId,
      value: this.toMoney(value),
    });
  }

  private toMoney(value: string | number | null | undefined): number {
    const parsed = Number(value ?? 0);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.round(parsed * 100) / 100;
  }
}
