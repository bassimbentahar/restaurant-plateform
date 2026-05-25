import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderStatusChangedEvent } from '../models/Order.model';

@Injectable({ providedIn: 'root' })
export class OrderRealtimeService {
  private client?: Client;

  private orderSubscription?: StompSubscription;
  private userOrdersSubscription?: StompSubscription;

  private readonly statusSubject = new Subject<OrderStatusChangedEvent>();
  private readonly userOrdersSubject = new Subject<OrderStatusChangedEvent>();

  readonly status$ = this.statusSubject.asObservable();
  readonly userOrders$ = this.userOrdersSubject.asObservable();

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: `${environment.wsUrl}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.log('[STOMP]', msg),
    });

    this.client.activate();
  }

  subscribeToOrder(orderId: string): void {
    this.connect();

    const subscribe = () => {
      this.orderSubscription?.unsubscribe();

      this.orderSubscription = this.client?.subscribe(
        `/topic/orders/${orderId}`,
        (message: IMessage) => {
          this.statusSubject.next(JSON.parse(message.body));
        }
      );
    };

    if (this.client?.connected) {
      subscribe();
    } else if (this.client) {
      this.client.onConnect = () => subscribe();
    }
  }

  subscribeToUserOrders(userId: string): void {
    this.connect();

    const subscribe = () => {
      this.userOrdersSubscription?.unsubscribe();

      this.userOrdersSubscription = this.client?.subscribe(
        `/topic/users/${userId}/orders`,
        (message: IMessage) => {
          this.userOrdersSubject.next(JSON.parse(message.body));
        }
      );
    };

    if (this.client?.connected) {
      subscribe();
    } else if (this.client) {
      this.client.onConnect = () => subscribe();
    }
  }

  disconnect(): void {
    this.orderSubscription?.unsubscribe();
    this.userOrdersSubscription?.unsubscribe();
    this.client?.deactivate();
  }
}
