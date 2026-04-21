import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItemsSignal = signal<CartItem[]>(this.loadInitialCart());

  readonly items = computed(() => this.cartItemsSignal());
  readonly count = computed(() =>
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.cartItemsSignal().reduce((sum, item) => sum + item.lineTotalPrice, 0)
  );

  addToCart(item: CartItem): void {
    const current = this.cartItemsSignal();
    const updated = [...current, item];
    this.cartItemsSignal.set(updated);
    this.persist(updated);
  }

  removeItem(cartItemId: string): void {
    const updated = this.cartItemsSignal().filter((item) => item.id !== cartItemId);
    this.cartItemsSignal.set(updated);
    this.persist(updated);
  }

  updateQuantity(cartItemId: string, quantity: number): void {
    const updated = this.cartItemsSignal().map((item) =>
      item.id === cartItemId
        ? {
          ...item,
          quantity,
          lineTotalPrice: item.unitFinalPrice * quantity,
        }
        : item
    );

    this.cartItemsSignal.set(updated);
    this.persist(updated);
  }

  private persist(items: CartItem[]): void {
    localStorage.setItem('Cart', JSON.stringify(items));
  }

  private loadInitialCart(): CartItem[] {
    try {
      const raw = localStorage.getItem('Cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.persist([]);
  }
}
