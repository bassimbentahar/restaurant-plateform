import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  IonGrid,
  IonIcon,
  IonRow,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, star } from 'ionicons/icons';
import { ProductService } from '../../services/product.service';
import { Currency } from '../../models/currency.model';
import { Product } from '../../models/product.model';

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
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

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
  }

  navigate(productId: string): void {
    this.router.navigate(['/product-details', productId]);
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

  trackById = (_: number, item: Product): string => item.id;
}
