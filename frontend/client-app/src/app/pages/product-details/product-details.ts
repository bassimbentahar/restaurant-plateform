import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AlertController,
  IonButton,
  IonCheckbox,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {basketOutline, cartOutline, heart, heartOutline,} from 'ionicons/icons';

import {Product, ProductOption, ProductOptionGroup, ProductVariant,} from '../../models/product.model';
import {CartItem, SelectedOption, SelectedVariant} from '../../models/cart-item.model';
import {Currency} from '../../models/currency.model';
import {ProductMockService} from '../../services/productMock.service';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    IonCheckbox,
    IonSpinner,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductMockService);
  private readonly cartService = inject(CartService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly loading = signal(true);
  readonly noOfItems = signal(0);
  readonly quantity = signal(1);
  readonly isLiked = signal(false);
  readonly product = signal<Product | null>(null);
  readonly currency = signal<Currency>({
    currencyName: 'CHF',
    currencySymbol: 'CHF',
  });

  readonly selectedVariant = signal<ProductVariant | null>(null);

  // clé = groupId, valeur = options choisies
  readonly selectedOptionsByGroup = signal<Record<string, ProductOption[]>>({});

  readonly totalPrice = computed(() => {
    const currentProduct = this.product();
    if (!currentProduct) {
      return 0;
    }

    const basePrice =
      this.selectedVariant()?.basePrice ??
      currentProduct.basePrice ??
      0;

    const optionsTotal = Object.values(this.selectedOptionsByGroup())
      .flat()
      .reduce((sum, option) => sum + option.priceDelta, 0);

    return (basePrice + optionsTotal) * this.quantity();
  });

  constructor() {
    addIcons({
      cartOutline,
      heart,
      heartOutline,
      basketOutline,
    });
  }

  ngOnInit(): void {
    this.loadCurrency();
    this.loadCartCount();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.router.navigateByUrl('/home');
        return;
      }

      this.loadProduct(id);
      this.loadFavouriteState(id);
    });
  }

  private loadCurrency(): void {
    const raw = localStorage.getItem('currency');

    if (!raw) {
      this.currency.set({
        currencyName: 'CHF',
        currencySymbol: 'CHF',
      });
      return;
    }

    try {
      this.currency.set(JSON.parse(raw));
    } catch {
      this.currency.set({
        currencyName: 'CHF',
        currencySymbol: 'CHF',
      });
    }
  }

  private loadCartCount(): void {
    this.noOfItems.set(this.cartService.getCartCount());
  }

  private loadProduct(productId: string): void {
    this.loading.set(true);

    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        if (!product) {
          this.router.navigateByUrl('/home');
          return;
        }

        this.product.set(product);

        const defaultVariant =
          product.variants?.find((variant) => variant.isDefault) ??
          product.variants?.find((variant) => variant.isAvailable !== false) ??
          null;

        this.selectedVariant.set(defaultVariant);
        this.initializeDefaultOptions(product);

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load product', error);
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
    });
  }

  private initializeDefaultOptions(product: Product): void {
    const initialSelections: Record<string, ProductOption[]> = {};

    for (const group of product.optionGroups ?? []) {
      const defaults = (group.options ?? []).filter(
        (option) =>
          option.isDefault &&
          option.isAvailable !== false &&
          this.isOptionAllowedForCurrentVariant(option)
      );

      if (defaults.length > 0) {
        initialSelections[group.id] = group.multiple ? defaults : [defaults[0]];
      } else {
        initialSelections[group.id] = [];
      }
    }

    this.selectedOptionsByGroup.set(initialSelections);
  }

  private loadFavouriteState(productId: string): void {
    const favourites = this.getFavourites();
    this.isLiked.set(favourites.includes(productId));
  }

  addQuantity(): void {
    if (this.quantity() < 10) {
      this.quantity.update((value) => value + 1);
    }
  }

  removeQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((value) => value - 1);
    }
  }

  navcart(): void {
    this.router.navigateByUrl('/cart');
  }

  home(): void {
    this.router.navigateByUrl('/home');
  }

  onVariantChange(variantId: string): void {
    const currentProduct = this.product();
    if (!currentProduct?.variants?.length) {
      return;
    }

    const found = currentProduct.variants.find((variant) => variant.id === variantId);
    if (!found) {
      return;
    }

    this.selectedVariant.set(found);

    // Nettoyage des options incompatibles avec la variante choisie
    const currentSelections = this.selectedOptionsByGroup();
    const cleanedSelections: Record<string, ProductOption[]> = {};

    for (const group of currentProduct.optionGroups ?? []) {
      const selected = currentSelections[group.id] ?? [];
      cleanedSelections[group.id] = selected.filter((option) =>
        this.isOptionAllowedForCurrentVariant(option)
      );
    }

    this.selectedOptionsByGroup.set(cleanedSelections);
  }

  onSingleOptionChange(group: ProductOptionGroup, optionId: string): void {
    const option = group.options.find(
      (item) =>
        item.id === optionId &&
        item.isAvailable !== false &&
        this.isOptionAllowedForCurrentVariant(item)
    );

    if (!option) {
      return;
    }

    this.selectedOptionsByGroup.update((state) => ({
      ...state,
      [group.id]: [option],
    }));
  }

  onMultiOptionChange(
    group: ProductOptionGroup,
    option: ProductOption,
    checked: boolean
  ): void {
    if (option.isAvailable === false || !this.isOptionAllowedForCurrentVariant(option)) {
      return;
    }

    const current = this.selectedOptionsByGroup()[group.id] ?? [];

    if (checked) {
      if (current.some((item) => item.id === option.id)) {
        return;
      }

      if (current.length >= group.maxSelect) {
        this.presentToast(
          `Maximum ${group.maxSelect} option(s) for "${group.name}"`,
          2000
        );
        return;
      }

      this.selectedOptionsByGroup.update((state) => ({
        ...state,
        [group.id]: [...current, option],
      }));
      return;
    }

    this.selectedOptionsByGroup.update((state) => ({
      ...state,
      [group.id]: current.filter((item) => item.id !== option.id),
    }));
  }

  isOptionSelected(groupId: string, optionId: string): boolean {
    return (this.selectedOptionsByGroup()[groupId] ?? []).some(
      (item) => item.id === optionId
    );
  }

  getSelectedOptionId(groupId: string): string | null {
    return this.selectedOptionsByGroup()[groupId]?.[0]?.id ?? null;
  }

  isOptionAllowedForCurrentVariant(option: ProductOption): boolean {
    const variant = this.selectedVariant();

    if (!option.allowedVariantIds?.length) {
      return true;
    }

    if (!variant) {
      return false;
    }

    return option.allowedVariantIds.includes(variant.id);
  }

  private validateSelections(): string[] {
    const currentProduct = this.product();
    if (!currentProduct) {
      return ['Product not found'];
    }

    const errors: string[] = [];

    if (currentProduct.variants?.length && !this.selectedVariant()) {
      errors.push('Please select a size.');
    }

    for (const group of currentProduct.optionGroups ?? []) {
      const selected = this.selectedOptionsByGroup()[group.id] ?? [];
      const count = selected.length;

      if (count < group.minSelect) {
        errors.push(`"${group.name}" requires at least ${group.minSelect} choice(s).`);
      }

      if (count > group.maxSelect) {
        errors.push(`"${group.name}" allows at most ${group.maxSelect} choice(s).`);
      }
    }

    return errors;
  }

  async addToCart(): Promise<void> {
    const currentProduct = this.product();
    if (!currentProduct) {
      return;
    }

    const validationErrors = this.validateSelections();
    if (validationErrors.length > 0) {
      const alert = await this.alertController.create({
        header: 'Please check your selection',
        message: validationErrors.join('<br>'),
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const selectedVariant: SelectedVariant | null = this.selectedVariant()
      ? {
        variantId: this.selectedVariant()!.id,
        variantName: this.selectedVariant()!.name,
        basePrice: this.selectedVariant()!.basePrice,
      }
      : null;

    const selectedOptions: SelectedOption[] = Object.entries(
      this.selectedOptionsByGroup()
    ).flatMap(([groupId, options]) => {
      const group = currentProduct.optionGroups?.find((item) => item.id === groupId);

      return options.map((option) => ({
        optionGroupId: groupId,
        optionGroupName: group?.name ?? '',
        optionId: option.id,
        optionName: option.name,
        priceDelta: option.priceDelta,
      }));
    });

    const baseUnitPrice =
      selectedVariant?.basePrice ??
      currentProduct.basePrice ??
      0;

    const optionsTotal = selectedOptions.reduce(
      (sum, option) => sum + option.priceDelta,
      0
    );

    const unitFinalPrice = baseUnitPrice + optionsTotal;
    const lineTotalPrice = unitFinalPrice * this.quantity();

    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      productId: currentProduct.id,
      productName: currentProduct.title,
      productImage: currentProduct.thumb ?? undefined,
      quantity: this.quantity(),
      selectedVariant,
      selectedOptions,
      baseUnitPrice,
      unitFinalPrice,
      lineTotalPrice,
    };

    this.cartService.addToCart(cartItem);
    this.loadCartCount();

    await this.presentToast('Added to cart', 2000);
  }

  async checkout(): Promise<void> {
    await this.addToCart();
    await this.router.navigateByUrl('/checkout');
  }

  async toggleFavourite(): Promise<void> {
    const currentProduct = this.product();
    if (!currentProduct) {
      return;
    }

    const favourites = this.getFavourites();

    if (favourites.includes(currentProduct.id)) {
      const updated = favourites.filter((id) => id !== currentProduct.id);
      localStorage.setItem('favourites', JSON.stringify(updated));
      this.isLiked.set(false);
      await this.presentToast('Removed from favourites', 2000);
      return;
    }

    localStorage.setItem(
      'favourites',
      JSON.stringify([...favourites, currentProduct.id])
    );
    this.isLiked.set(true);
    await this.presentToast('Added to favourites', 2000);
  }

  private getFavourites(): string[] {
    const raw = localStorage.getItem('favourites');
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async presentToast(message: string, duration: number): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
    });
    await toast.present();
  }
}
