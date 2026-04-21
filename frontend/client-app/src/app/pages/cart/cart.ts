import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cartOutline,
  trashOutline,
  addOutline,
  removeOutline,
} from 'ionicons/icons';

import { Currency } from '../../models/currency.model';
import { CartItem } from '../../models/cart-item.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonBadge,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly alertController = inject(AlertController);

  readonly currency = signal<Currency>({
    currencyName: 'CHF',
    currencySymbol: 'CHF',
  });

  // ✅ branché directement sur le service
  readonly items = this.cartService.items;
  readonly cartCount = this.cartService.count;
  readonly cartTotal = this.cartService.subtotal;

  constructor() {
    addIcons({
      arrowBackOutline,
      cartOutline,
      trashOutline,
      addOutline,
      removeOutline,
    });

    this.loadCurrency();
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

  backToProducts(): void {
    this.router.navigateByUrl('/product-list');
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }

    this.cartService.updateQuantity(item.id, item.quantity - 1);
  }

  async removeItem(item: CartItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Remove item',
      message: `Remove "${item.productName}" from cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.cartService.removeItem(item.id);
          },
        },
      ],
    });

    await alert.present();
  }

  async clearCart(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Clear cart',
      message: 'Do you want to remove all items from the cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            this.cartService.clearCart();
          },
        },
      ],
    });

    await alert.present();
  }

  checkout(): void {
    this.router.navigateByUrl('/checkout');
  }

  trackById = (_: number, item: CartItem): string => item.id;
}
