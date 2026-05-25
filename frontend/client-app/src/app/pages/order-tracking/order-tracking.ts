import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  homeOutline,
  receiptOutline,
  restaurantOutline,
  timeOutline,
  walkOutline,
} from 'ionicons/icons';
import { Subject, takeUntil } from 'rxjs';
import {OrderService} from "../../services/OrderService";
import {OrderRealtimeService} from "../../services/OrderRealtimeService";
import {OrderResponse, OrderStatusChangedEvent} from "../../models/Order.model";
import {getOrderStatusLabelKey, getOrderSteps, OrderStatus, OrderType} from "./config/order-steps.config";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    TranslatePipe,
  ],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss',
})
export class OrderTracking implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly orderRealtimeService = inject(OrderRealtimeService);
  private readonly destroy$ = new Subject<void>();

  readonly loading = signal(true);
  readonly order = signal<OrderResponse | null>(null);
  readonly status = signal<OrderStatus | null>(null);
  readonly steps = computed(() => {
    return getOrderSteps(this.order()?.orderType as OrderType);
  });

  readonly statusLabelKey = computed(() => {
    return getOrderStatusLabelKey(
      this.status(),
      this.order()?.orderType as OrderType
    );
  });

  readonly currentStepIndex = computed(() => {
    const current = this.status();

    if (!current) {
      return 0;
    }

    const index = this.steps().findIndex(step => step.status === current);
    return index >= 0 ? index : 0;
  });

  readonly isCancelled = computed(() => {
    const current = this.status();
    return current === 'CANCELLED' || current === 'REJECTED';
  });

  constructor() {
    addIcons({
      receiptOutline,
      checkmarkCircleOutline,
      restaurantOutline,
      timeOutline,
      walkOutline,
      closeCircleOutline,
      homeOutline,
    });
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadOrder(orderId);
    this.listenRealtime(orderId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.orderRealtimeService.disconnect();
  }

  private loadOrder(orderId: string): void {
    this.loading.set(true);

    this.orderService.findById(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.status.set(order.status as OrderStatus);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('ORDER LOAD ERROR', error);
        this.loading.set(false);
      },
    });
  }

  private listenRealtime(orderId: string): void {
    this.orderRealtimeService.subscribeToOrder(orderId);

    this.orderRealtimeService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: OrderStatusChangedEvent) => {
        if (event.orderId !== orderId) {
          return;
        }

        this.status.set(event.newStatus as OrderStatus);

        const currentOrder = this.order();

        if (currentOrder) {
          this.order.set({
            ...currentOrder,
            status: event.newStatus,
          });
        }
      });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
