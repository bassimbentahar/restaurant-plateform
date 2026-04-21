import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, remove, trashOutline } from 'ionicons/icons';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-basket-panel',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
  templateUrl: './basket-panel.html',
  styleUrl: './basket-panel.scss',
})
export class BasketPanel {
  private readonly cartService = inject(CartService);

  readonly items = this.cartService.items;
  readonly count = this.cartService.count;
  readonly subtotal = this.cartService.subtotal;

  readonly serviceFee = computed(() => this.subtotal() * 0.06);
  readonly total = computed(() => this.subtotal() + this.serviceFee());

  constructor() {
    addIcons({ add, remove, trashOutline });
  }

  increase(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity + 1);
  }

  decrease(itemId: string, quantity: number): void {
    if (quantity <= 1) {
      this.cartService.removeItem(itemId);
      return;
    }

    this.cartService.updateQuantity(itemId, quantity - 1);
  }

  remove(itemId: string): void {
    this.cartService.removeItem(itemId);
  }
}
