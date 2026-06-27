import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  archiveOutline,
  createOutline,
  folderOpenOutline,
  gridOutline,
  imageOutline,
  listOutline,
  pricetagOutline,
  refreshOutline,
  restaurantOutline,
  searchOutline,
  starOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

import { ProductAdminApiService } from '../product-wizard/data-access/product-admin-api.service';
import {
  ProductCategoryResponse,
  ProductSummaryResponse,
} from '../product-wizard/data-access/product-admin.dto';

type ProductFilterId =
  | 'all'
  | 'available'
  | 'unavailable'
  | 'featured'
  | 'archived';

type ProductViewMode = 'cards' | 'list';

interface ProductFilter {
  id: ProductFilterId;
  labelKey: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonBadge,
    IonButton,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
  ],
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.scss'],
})
export class AdminProducts implements OnInit {
  private readonly api = inject(ProductAdminApiService);
  private readonly router = inject(Router);

  private readonly viewModeStorageKey = 'admin-products-view-mode';

  readonly products = signal<ProductSummaryResponse[]>([]);
  readonly loading = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly selectedFilter = signal<ProductFilterId>('all');
  readonly viewMode = signal<ProductViewMode>(this.readInitialViewMode());

  /**
   * Si le backend renvoie une URL cassée, on la marque ici pour ne pas afficher
   * l'image cassée du navigateur. On affiche alors un placeholder premium.
   */
  readonly brokenImageProductIds = signal<Set<string>>(new Set());

  readonly filters: ProductFilter[] = [
    {
      id: 'all',
      labelKey: 'adminProducts.filters.all',
    },
    {
      id: 'available',
      labelKey: 'adminProducts.filters.available',
    },
    {
      id: 'unavailable',
      labelKey: 'adminProducts.filters.unavailable',
    },
    {
      id: 'featured',
      labelKey: 'adminProducts.filters.featured',
    },
    {
      id: 'archived',
      labelKey: 'adminProducts.filters.archived',
    },
  ];

  readonly filteredProducts = computed(() => {
    const search = this.normalize(this.searchTerm());
    const filter = this.selectedFilter();

    return this.products().filter((product) => {
      const matchesSearch = !search || this.matchesSearch(product, search);
      const matchesFilter = this.matchesFilter(product, filter);

      return matchesSearch && matchesFilter;
    });
  });

  readonly productCounts = computed<Record<ProductFilterId, number>>(() => {
    const products = this.products();

    return {
      all: products.length,
      available: products.filter((product) => this.isAvailable(product)).length,
      unavailable: products.filter((product) => !this.isAvailable(product)).length,
      featured: products.filter((product) => this.isFeatured(product)).length,
      archived: products.filter((product) => this.isArchived(product)).length,
    };
  });

  constructor() {
    addIcons({
      addCircleOutline,
      archiveOutline,
      createOutline,
      folderOpenOutline,
      gridOutline,
      imageOutline,
      listOutline,
      pricetagOutline,
      refreshOutline,
      restaurantOutline,
      searchOutline,
      starOutline,
    });
  }

  ngOnInit(): void {
    void this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.errorKey.set(null);
    this.brokenImageProductIds.set(new Set());

    try {
      const products = await firstValueFrom(this.api.getProducts());
      this.products.set(products ?? []);
    } catch (error) {
      console.error('Impossible de charger les produits', error);
      this.errorKey.set('adminProducts.errors.loadFailed');
    } finally {
      this.loading.set(false);
    }
  }

  updateSearchTerm(value: string | null | undefined): void {
    this.searchTerm.set(String(value ?? ''));
  }

  updateFilter(value: string | number | null | undefined): void {
    const filter = String(value ?? 'all');

    if (this.isProductFilterId(filter)) {
      this.selectedFilter.set(filter);
      return;
    }

    this.selectedFilter.set('all');
  }

  setViewMode(value: string | number | null | undefined): void {
    const mode = String(value ?? 'cards') === 'list' ? 'list' : 'cards';

    this.viewMode.set(mode);
    localStorage.setItem(this.viewModeStorageKey, mode);
  }

  createProduct(): void {
    void this.router.navigate(['/menu/products/new']);
  }

  editProduct(product: ProductSummaryResponse): void {
    const id = this.productId(product);

    if (!id) {
      console.warn('Impossible de modifier le produit : id manquant', product);
      return;
    }

    void this.router.navigate(['/menu/products', id, 'edit']);
  }

  markProductImageAsBroken(product: ProductSummaryResponse): void {
    const id = this.productId(product);

    if (!id) {
      return;
    }

    this.brokenImageProductIds.update((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(id);

      return nextIds;
    });
  }

  productId(product: ProductSummaryResponse): string {
    return this.toStringValue(this.read(product, 'id'));
  }

  productTitle(product: ProductSummaryResponse): string {
    return (
      this.toStringValue(this.read(product, 'title')) ||
      this.toStringValue(this.read(product, 'name')) ||
      'Produit'
    );
  }

  productSlug(product: ProductSummaryResponse): string {
    return this.toStringValue(this.read(product, 'slug'));
  }

  productDescription(product: ProductSummaryResponse): string {
    return this.toStringValue(this.read(product, 'shortDescription'));
  }

  productThumb(product: ProductSummaryResponse): string | null {
    const id = this.productId(product);

    if (id && this.brokenImageProductIds().has(id)) {
      return null;
    }

    const thumb = this.toStringValue(this.read(product, 'thumb')).trim();

    if (!thumb || thumb === 'null' || thumb === 'undefined') {
      return null;
    }

    return thumb;
  }

  productPrice(product: ProductSummaryResponse): number {
    const value = this.read(product, 'basePrice');
    const price = Number(value);

    return Number.isFinite(price) ? price : 0;
  }

  isAvailable(product: ProductSummaryResponse): boolean {
    const value =
      this.read(product, 'available') ??
      this.read(product, 'isAvailable');

    return value !== false;
  }

  isFeatured(product: ProductSummaryResponse): boolean {
    return Boolean(
      this.read(product, 'featured') ??
        this.read(product, 'isFeatured')
    );
  }

  isArchived(product: ProductSummaryResponse): boolean {
    return Boolean(
      this.read(product, 'archived') ??
        this.read(product, 'isArchived')
    );
  }

  productCategories(product: ProductSummaryResponse): ProductCategoryResponse[] {
    const categories = this.read(product, 'categories');

    return Array.isArray(categories)
      ? (categories as ProductCategoryResponse[])
      : [];
  }

  categoryName(category: ProductCategoryResponse): string {
    return (
      this.toStringValue(this.read(category, 'name')) ||
      this.toStringValue(this.read(category, 'title')) ||
      this.toStringValue(this.read(category, 'label')) ||
      ''
    );
  }

  statusLabelKey(product: ProductSummaryResponse): string {
    if (this.isArchived(product)) {
      return 'adminProducts.status.archived';
    }

    if (!this.isAvailable(product)) {
      return 'adminProducts.status.unavailable';
    }

    return 'adminProducts.status.available';
  }

  statusColor(product: ProductSummaryResponse): string {
    if (this.isArchived(product)) {
      return 'medium';
    }

    if (!this.isAvailable(product)) {
      return 'warning';
    }

    return 'success';
  }

  private matchesFilter(
    product: ProductSummaryResponse,
    filter: ProductFilterId
  ): boolean {
    switch (filter) {
      case 'all':
        return true;

      case 'available':
        return this.isAvailable(product) && !this.isArchived(product);

      case 'unavailable':
        return !this.isAvailable(product) && !this.isArchived(product);

      case 'featured':
        return this.isFeatured(product);

      case 'archived':
        return this.isArchived(product);
    }
  }

  private matchesSearch(
    product: ProductSummaryResponse,
    search: string
  ): boolean {
    const categoryMatches = this.productCategories(product).some((category) =>
      this.normalize(this.categoryName(category)).includes(search)
    );

    return (
      this.normalize(this.productTitle(product)).includes(search) ||
      this.normalize(this.productSlug(product)).includes(search) ||
      this.normalize(this.productDescription(product)).includes(search) ||
      categoryMatches
    );
  }

  private isProductFilterId(value: string): value is ProductFilterId {
    return (
      value === 'all' ||
      value === 'available' ||
      value === 'unavailable' ||
      value === 'featured' ||
      value === 'archived'
    );
  }

  private read(
    source: unknown,
    key: string
  ): unknown {
    if (source === null || source === undefined) {
      return undefined;
    }

    return (source as Record<string, unknown>)[key];
  }

  private toStringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private readInitialViewMode(): ProductViewMode {
    const value = localStorage.getItem(this.viewModeStorageKey);

    return value === 'list' ? 'list' : 'cards';
  }
}
