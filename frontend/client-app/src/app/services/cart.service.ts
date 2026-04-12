import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'Cart';

  getCart(): CartItem[] {
    const raw = localStorage.getItem(this.storageKey);
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

  saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  addToCart(item: CartItem): void {
    const cart = this.getCart();
    cart.push(item);
    this.saveCart(cart);
  }

  removeItem(cartItemId: string): void {
    const updated = this.getCart().filter((item) => item.id !== cartItemId);
    this.saveCart(updated);
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }

  updateQuantity(cartItemId: string, quantity: number): void {
    const cart = this.getCart().map((item) => {
      if (item.id !== cartItemId) {
        return item;
      }

      const safeQuantity = quantity < 1 ? 1 : quantity;
      return {
        ...item,
        quantity: safeQuantity,
        lineTotalPrice: item.unitFinalPrice * safeQuantity,
      };
    });

    this.saveCart(cart);
  }

  getCartCount(): number {
    return this.getCart().length;
  }

  getCartTotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.lineTotalPrice, 0);
  }
}
