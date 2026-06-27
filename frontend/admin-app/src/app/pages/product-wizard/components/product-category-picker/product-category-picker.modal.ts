import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  folderOpenOutline,
  pricetagOutline,
} from 'ionicons/icons';

import { ProductCategoryResponse } from '../../data-access/product-admin.dto';

export type ProductCategoryPickerResult =
  | {
  categoryIds: string[];
}
  | {
  categoryIds: string[];
  name: string;
};

@Component({
  selector: 'app-product-category-picker-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonBadge,
    IonCheckbox,
    TranslatePipe,
  ],
  templateUrl: './product-category-picker.modal.html',
  styleUrl: './product-category-picker.modal.scss',
})
export class ProductCategoryPickerModal implements OnInit {
  private readonly modalController = inject(ModalController);

  @Input({ required: true }) categories: ProductCategoryResponse[] = [];
  @Input() selectedCategoryIds: string[] = [];

  readonly searchTerm = signal('');
  readonly newCategoryName = signal('');
  readonly selectedIds = signal<string[]>([]);

  readonly filteredCategories = computed(() => {
    const term = this.normalize(this.searchTerm());

    if (!term) {
      return this.categories;
    }

    return this.categories.filter((category) => {
      const name = this.normalize(category.name);
      const slug = this.normalize(category.slug);

      return name.includes(term) || slug.includes(term);
    });
  });

  readonly selectedCategories = computed(() => {
    const ids = new Set(this.selectedIds());

    return this.categories.filter((category) => ids.has(category.id));
  });

  readonly selectedCount = computed(() => this.selectedIds().length);

  readonly canConfirm = computed(() => this.selectedIds().length > 0);

  readonly canCreateCategory = computed(() => {
    const name = this.newCategoryName().trim();

    if (name.length < 2) {
      return false;
    }

    const normalizedName = this.normalize(name);

    return !this.categories.some(
      (category) => this.normalize(category.name) === normalizedName
    );
  });

  readonly categoryAlreadyExists = computed(() => {
    const name = this.newCategoryName().trim();

    if (!name) {
      return false;
    }

    const normalizedName = this.normalize(name);

    return this.categories.some(
      (category) => this.normalize(category.name) === normalizedName
    );
  });

  constructor() {
    addIcons({
      addCircleOutline,
      checkmarkCircleOutline,
      closeOutline,
      folderOpenOutline,
      pricetagOutline,
    });
  }

  ngOnInit(): void {
    this.selectedIds.set([...new Set(this.selectedCategoryIds ?? [])]);
  }

  updateSearch(value: string | number | null | undefined): void {
    this.searchTerm.set(String(value ?? ''));
  }

  updateNewCategoryName(value: string | number | null | undefined): void {
    this.newCategoryName.set(String(value ?? ''));
  }

  isSelected(categoryId: string): boolean {
    return this.selectedIds().includes(categoryId);
  }

  toggleCategory(categoryId: string): void {
    this.selectedIds.update((ids) => {
      if (ids.includes(categoryId)) {
        return ids.filter((id) => id !== categoryId);
      }

      return [...ids, categoryId];
    });
  }

  confirmSelection(): void {
    if (!this.canConfirm()) {
      return;
    }

    this.modalController.dismiss(
      {
        categoryIds: this.selectedIds(),
      } satisfies ProductCategoryPickerResult,
      'confirm'
    );
  }

  createAndSelect(): void {
    const name = this.newCategoryName().trim();

    if (!this.canCreateCategory()) {
      return;
    }

    this.modalController.dismiss(
      {
        categoryIds: this.selectedIds(),
        name,
      } satisfies ProductCategoryPickerResult,
      'create'
    );
  }

  dismiss(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  private normalize(value: string | null | undefined): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
