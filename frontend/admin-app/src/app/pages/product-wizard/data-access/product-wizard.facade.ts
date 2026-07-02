import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ProductAdminApiService } from './product-admin-api.service';
import { ProductDraftMapper } from './product-draft.mapper';
import { ProductEditorStore } from '../state/product-editor.store';
import {
  ProductCategoryResponse,
  ProductCreatedResponse,
  ProductStatus,
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

  async saveDraft(productId?: string | null): Promise<string | null> {
    return this.saveWithStatus(productId, 'DRAFT');
  }

  async publishProduct(productId?: string | null): Promise<string | null> {
    if (!this.store.canPublish()) {
      this.error.set('adminProductWizard.errors.invalidProduct');
      return null;
    }

    if (this.store.draft().categoryIds.length === 0) {
      this.error.set('adminProductWizard.errors.categoryRequired');
      return null;
    }

    return this.saveWithStatus(productId, 'PUBLISHED');
  }

  async updateProduct(
    productId: string,
    status: ProductStatus = 'PUBLISHED'
  ): Promise<string | null> {
    return this.saveWithStatus(productId, status);
  }

  async archiveProduct(productId: string): Promise<string | null> {
    return this.saveWithStatus(productId, 'ARCHIVED');
  }

  private async saveWithStatus(
    productId: string | null | undefined,
    status: ProductStatus
  ): Promise<string | null> {
    this.saving.set(true);
    this.error.set(null);

    try {
      const request = this.productDraftMapper.toCreateRequest(
        this.store.draft(),
        status
      );

      console.log('Draft actuel :', this.store.draft());
      console.log('Payload produit envoyé au backend :', request);

      const response: ProductCreatedResponse = productId
        ? await firstValueFrom(
          this.productAdminApi.updateProduct(productId, request)
        )
        : await firstValueFrom(
          this.productAdminApi.createProduct(request)
        );

      this.createdProductId.set(response.id);

      this.store.updateStatus(status);

      console.log('Produit sauvegardé avec succès :', response);

      return response.id;
    } catch (error: unknown) {
      const message = this.resolveSaveError(status, error);

      console.error('Erreur sauvegarde produit :', error);
      console.error('Message normalisé :', message);

      this.error.set(message);

      return null;
    } finally {
      this.saving.set(false);
    }
  }

  async loadOptionGroups(): Promise<void> {
    try {
      const choices = await firstValueFrom(
        this.productAdminApi.getOptionGroups()
      );

      this.store.setLibraryChoices(choices);
    } catch (error: unknown) {
      console.error('Erreur chargement option groups :', error);
      this.error.set('adminProductWizard.errors.loadOptionGroupsFailed');
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
      this.error.set('adminProductWizard.errors.loadCategoriesFailed');
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

  private resolveSaveError(
    status: ProductStatus,
    error: unknown
  ): string {
    const backendMessage = this.normalizeError(error);

    if (backendMessage) {
      return backendMessage;
    }

    switch (status) {
      case 'DRAFT':
        return 'adminProductWizard.errors.saveDraftFailed';

      case 'PUBLISHED':
        return 'adminProductWizard.errors.publishFailed';

      case 'ARCHIVED':
        return 'adminProductWizard.errors.archiveFailed';
    }
  }

  private normalizeError(error: unknown): string | null {
    if (!this.isHttpLikeError(error)) {
      return error instanceof Error ? error.message : null;
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

    return null;
  }

  private isHttpLikeError(error: unknown): error is HttpLikeError {
    return typeof error === 'object' && error !== null;
  }
}
