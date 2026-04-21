import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid, IonHeader,
  IonIcon,
  IonRow,
  IonSearchbar,
  IonSpinner, IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, star } from 'ionicons/icons';
import { ProductMockService } from '../../services/productMock.service';
import { Currency } from '../../models/currency.model';
import { Product } from '../../models/product.model';
import {ProductService} from "../../services/product.service";
import {ImageService} from "../../services/image.service";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSpinner,
    IonToolbar,
    IonHeader,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  protected readonly imageService = inject(ImageService);
  protected activeCategoryId = signal<string | null>(null);
  protected imageErrors = new Set<string>();
  @ViewChildren('categoryBtn') categoryButtons!: QueryList<ElementRef>;
  @ViewChildren('categorySection') sections!: QueryList<ElementRef>;
  readonly loading = signal(true);
  readonly noOfItems = signal(0);
  readonly searchTerm = signal('');
  readonly categoryId = signal<string | null>(null);
  readonly currency = signal<Currency>({
    currencySymbol: 'CHF',
    currencyName: 'CHF',
  });
  readonly items = signal<Product[]>([]);

  readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const products = this.items();

    if (!term) {
      return products;
    }

    return products.filter((product) =>
      product.title.toLowerCase().includes(term)
    );
  });

  constructor() {
    addIcons({
      cartOutline,
      star,
    });
  }

  ngOnInit(): void {
    this.loadCurrency();
    this.loadCartCount();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.categoryId.set(id);

      if (!id) {
        this.loadAllProducts();
        return;
      }

      this.loadProducts(id);
    });
  }

  private loadAllProducts(): void {
    this.loading.set(true);

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        const normalized = products.map((product) => ({
          ...product,

          reviews: product.reviews ?? [],
          variants: product.variants ?? [],
          optionGroups: product.optionGroups ?? [],
        }));

        this.items.set(normalized);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load all products', error);
        this.items.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadProducts(categoryId: string): void {
    this.loading.set(true);

    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        const normalized = products.map((product) => ({
          ...product,
          reviews: product.reviews ?? [],
          variants: product.variants ?? [],
          optionGroups: product.optionGroups ?? [],
        }));

        this.items.set(normalized);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load products', error);
        this.items.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadCurrency(): void {
    const value = localStorage.getItem('currency');

    if (!value) {
      this.currency.set({
        currencySymbol: 'CHF',
        currencyName: 'CHF',
      });
      return;
    }

    try {
      this.currency.set(JSON.parse(value));
    } catch {
      this.currency.set({
        currencySymbol: 'CHF',
        currencyName: 'CHF',
      });
    }
  }

  private loadCartCount(): void {
    const cart = JSON.parse(localStorage.getItem('Cart') ?? '[]');
    this.noOfItems.set(Array.isArray(cart) ? cart.length : 0);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLIonSearchbarElement & { value?: string };
    this.searchTerm.set(target.value ?? '');
    this.activeCategoryId.set('all');
  }

  navigate(productId: string): void {
    this.router.navigate(['/product-details', productId]);
  }

  scrollToTop(): void  {
    this.setActiveCategory('all');
    const content = document.querySelector('ion-content');
    content?.scrollToTop?.(500);
  }

  onContentScroll(event: Event): void {

    let currentCategoryId = 'all';
    let minDistance = Number.POSITIVE_INFINITY;

    this.sections.forEach((section) => {
      const el = section.nativeElement as HTMLElement;

      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top - 140);

      if (rect.top <= 180 && distance < minDistance) {
        minDistance = distance;
        currentCategoryId = el.dataset['categoryId'] || 'all';
      }
    });

    this.setActiveCategory(currentCategoryId);

  }

  getPrice(item: Product): number | null {
    if (item.variants?.length) {
      const defaultVariant =
        item.variants.find((variant) => variant.isDefault) ??
        item.variants.find((variant) => variant.isAvailable !== false) ??
        item.variants[0];

      return defaultVariant?.basePrice ?? null;
    }

    return item.basePrice ?? null;
  }

  getAverageRating(item: Product): number {
    if (!item.reviews?.length) {
      return 0;
    }

    const total = item.reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return total / item.reviews.length;
  }

  getStars(item: Product): number[] {
    const count = Math.round(this.getAverageRating(item));
    return Array.from({ length: count }, (_, i) => i);
  }

  groupedCategories = computed(() => {
    const items = this.filteredItems();

    const map = new Map<string, { id: string; name: string; items: Product[] }>();

    for (const item of items) {
      const categoryId = item.category?.id;
      const categoryName = item.category?.name;

      if (!categoryId || !categoryName) continue;

      if (!map.has(categoryId)) {
        map.set(categoryId, {
          id: categoryId,
          name: categoryName,
          items: [],
        });
      }

      map.get(categoryId)!.items.push(item);
    }

    return Array.from(map.values());
  });

  scrollToCategory(categoryId: string): void {
    const el = document.getElementById(`category-${categoryId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.setActiveCategory(categoryId);
    }
  }

  onImageError(item: Product) {
    this.imageErrors.add(item.id);
  }

  hasImageError(item: Product): boolean {
    return this.imageErrors.has(item.id);
  }

  scrollActiveCategoryIntoView() {
    const activeId = this.activeCategoryId();

    const activeBtn = this.categoryButtons.find(btn =>
      btn.nativeElement.getAttribute('data-id') === activeId
    );

    if (activeBtn) {
      activeBtn.nativeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }

  setActiveCategory(id: string) {
    if (this.activeCategoryId() !== id) {
      this.activeCategoryId.set(id);

      setTimeout(() => this.scrollActiveCategoryIntoView(), 0);
    }
  }

  trackById = (_: number, item: Product): string => item.id;
}
