import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ProductAdminApiService } from './product-admin-api.service';
import { ProductDraftMapper } from './product-draft.mapper';
import { ProductEditorStore } from '../state/product-editor.store';
import {
  ProductCategoryResponse,
  ProductCreateRequest,
  ProductCreatedResponse,
} from './product-admin.dto';

type HttpLikeError = {
  status?: number;
  message?: string;
  error?: string | { message?: string };
};

@Injectable()
export class ProductWizardFacade {
  private readonly productAdminApi = inject(ProductAdminApiService);
  private readonly productDraftMapper = inject(ProductDraftMapper);
  private readonly store = inject(ProductEditorStore);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly createdProductId = signal<string | null>(null);

  canSubmit(): boolean {
    return this.store.canPublish();
  }

  async saveDraft(): Promise<void> {
    const request = this.productDraftMapper.toCreateRequest(this.store.draft());

    console.log('Draft actuel :', this.store.draft());
    console.log('Payload draft prêt backend :', request);
  }

  async publish(): Promise<void> {
    if (!this.store.canPublish()) {
      this.error.set('Le produit contient encore des erreurs.');
      return;
    }

    if (this.store.draft().categoryIds.length === 0) {
      this.error.set('Veuillez sélectionner une catégorie.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      const request: ProductCreateRequest =
        this.productDraftMapper.toCreateRequest(this.store.draft());

      console.log('Payload envoyé au backend :', request);
      this.logNullValues(request);

      const response: ProductCreatedResponse = await firstValueFrom(
        this.productAdminApi.createProduct(request)
      );

      this.createdProductId.set(response.id);

      console.log('Produit créé avec succès :', response);
    } catch (error: unknown) {
      const message = this.normalizeError(error);

      console.error('Erreur création produit complète :', error);
      console.error('Message normalisé :', message);

      this.error.set(message);
    } finally {
      this.saving.set(false);
    }
  }

  async updateProduct(productId: string): Promise<void> {
    if (!this.store.canPublish()) {
      return;
    }

    const request = this.productDraftMapper.toCreateRequest(this.store.draft());

    await firstValueFrom(
      this.productAdminApi.updateProduct(productId, request)
    );
  }

  async loadOptionGroups(): Promise<void> {
    try {
      const choices = await firstValueFrom(
        this.productAdminApi.getOptionGroups()
      );

      this.store.setLibraryChoices(choices);
    } catch (error: unknown) {
      console.error('Erreur chargement option groups :', error);
      this.error.set('Impossible de charger la bibliothèque de choix.');
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const categories = await firstValueFrom(
        this.productAdminApi.getCategories()
      );

      this.store.setCategories(categories);
    } catch (error: unknown) {
      console.error('Erreur chargement catégories :', error);
      this.error.set('Impossible de charger les catégories.');
    }
  }

  async createCategory(name: string): Promise<ProductCategoryResponse> {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error('Category name is required');
    }

    const category = await firstValueFrom(
      this.productAdminApi.createCategory({
        name: trimmedName,
      })
    );

    this.store.addCategory(category);

    return category;
  }

  private logNullValues(value: unknown, path = '$'): void {
    if (value === null) {
      console.warn('NULL dans le payload à :', path);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        this.logNullValues(item, `${path}[${index}]`);
      });
      return;
    }

    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([key, nestedValue]) => {
        this.logNullValues(nestedValue, `${path}.${key}`);
      });
    }
  }

  private normalizeError(error: unknown): string {
    if (!this.isHttpLikeError(error)) {
      return error instanceof Error
        ? error.message
        : 'Impossible de créer le produit.';
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (
      typeof error.error === 'object' &&
      error.error !== null &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    if (typeof error.message === 'string') {
      return error.message;
    }

    return 'Impossible de créer le produit.';
  }

  private isHttpLikeError(error: unknown): error is HttpLikeError {
    return typeof error === 'object' && error !== null;
  }
}
