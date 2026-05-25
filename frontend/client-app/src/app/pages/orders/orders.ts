import {CommonModule} from '@angular/common';
import {Component, OnInit, computed, inject, signal, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {addIcons} from 'ionicons';
import {
  receiptOutline,
  chevronForwardOutline,
  refreshOutline,
  alertCircleOutline,
} from 'ionicons/icons';

import {OrderService} from '../../services/OrderService';
import {OrderResponse, OrderStatusChangedEvent} from '../../models/Order.model';
import {
  getOrderStatusLabelKey,
  OrderStatus,
  OrderType,
} from '../order-tracking/config/order-steps.config';
import {Subject, take, takeUntil} from "rxjs";
import {Auth} from "shared";
import {OrderRealtimeService} from "../../services/OrderRealtimeService";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    TranslatePipe,
    IonRefresherContent,
    IonRefresher,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly orders = signal<OrderResponse[]>([]);
  private readonly orderRealtimeService = inject(OrderRealtimeService);
  private readonly userService = inject(UserService);
  private readonly destroy$ = new Subject<void>();

  readonly hasOrders = computed(() => this.orders().length > 0);
  readonly activeOrders = computed(() =>
    this.orders().filter(order => this.isActiveOrder(order))
  );

  readonly pastOrders = computed(() =>
    this.orders().filter(order => !this.isActiveOrder(order))
  );

  isActiveOrder(order: OrderResponse): boolean {
    return [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
    ].includes(order.status);
  }

  orderStateKey(order: OrderResponse): string {
    if (order.status === 'DELIVERED') {
      return 'orders.badges.delivered';
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return 'orders.badges.cancelled';
    }

    return 'orders.badges.active';
  }

  orderStateClass(order: OrderResponse): string {
    if (order.status === 'DELIVERED') {
      return 'delivered';
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return 'cancelled';
    }

    return 'active';
  }

  deliveryTimeData(order: OrderResponse):
    | { type: 'ASAP' }
    | { type: 'SCHEDULED'; date: Date } {

    if (!order.scheduledDate || !order.scheduledTime) {
      return {type: 'ASAP'};
    }

    return {
      type: 'SCHEDULED',
      date: new Date(`${order.scheduledDate}T${order.scheduledTime}`),
    };
  }

  constructor() {
    addIcons({
      receiptOutline,
      chevronForwardOutline,
      refreshOutline,
      alertCircleOutline,
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.listenRealtimeOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(false);

    this.orderService.findMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(this.sortOrders(orders));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('ORDERS LOAD ERROR', error);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  statusLabelKey(order: OrderResponse): string {
    return getOrderStatusLabelKey(
      order.status as OrderStatus,
      order.orderType as OrderType
    );
  }

  openTracking(order: OrderResponse): void {
    this.router.navigate(['/orders', order.id, 'tracking']);
  }

  goToMenu(): void {
    this.router.navigate(['/home']);
  }

  trackByOrderId(_: number, order: OrderResponse): string {
    return order.id;
  }

  private sortOrders(orders: OrderResponse[]): OrderResponse[] {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  }

  refreshOrders(event: CustomEvent): void {
    this.orderService.findMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(this.sortOrders(orders));
        this.error.set(false);
        event.detail.complete();
      },
      error: (error) => {
        console.error('ORDERS REFRESH ERROR', error);
        this.error.set(true);
        event.detail.complete();
      },
    });
  }

  private listenRealtimeOrders(): void {
    this.userService.user$
      .pipe(take(1))
      .subscribe(user => {
        const userId = user?.id;

        if (!userId) {
          return;
        }

        this.orderRealtimeService.subscribeToUserOrders(userId);

        this.orderRealtimeService.userOrders$
          .pipe(takeUntil(this.destroy$))
          .subscribe((event) => {
            this.handleRealtimeOrderEvent(event);
          });
      });
  }

  private handleRealtimeOrderEvent(event: OrderStatusChangedEvent): void {
    const currentOrders = this.orders();
    const index = currentOrders.findIndex(order => order.id === event.orderId);

    if (index === -1) {
      this.loadOrders();
      return;
    }

    const updatedOrders = [...currentOrders];

    updatedOrders[index] = {
      ...updatedOrders[index],
      status: event.newStatus,
    };

    this.orders.set(this.sortOrders(updatedOrders));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
