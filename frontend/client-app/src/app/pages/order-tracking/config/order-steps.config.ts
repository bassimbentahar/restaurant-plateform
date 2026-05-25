export type OrderType = 'PICKUP' | 'DELIVERY';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderStep {
  status: OrderStatus;
  titleKey: string;
  descriptionKey: string;
  icon: string;
}

const COMMON_STEPS: OrderStep[] = [
  {
    status: 'PENDING',
    titleKey: 'order.steps.pending.title',
    descriptionKey: 'order.steps.pending.description',
    icon: 'receipt-outline',
  },
  {
    status: 'CONFIRMED',
    titleKey: 'order.steps.confirmed.title',
    descriptionKey: 'order.steps.confirmed.description',
    icon: 'checkmark-circle-outline',
  },
  {
    status: 'PREPARING',
    titleKey: 'order.steps.preparing.title',
    descriptionKey: 'order.steps.preparing.description',
    icon: 'restaurant-outline',
  },
];
export const ORDER_STEPS_BY_TYPE: Record<OrderType, OrderStep[]> = {
  DELIVERY: [
    ...COMMON_STEPS,
    {
      status: 'READY',
      titleKey: 'order.steps.ready.delivery.title',
      descriptionKey: 'order.steps.ready.delivery.description',
      icon: 'time-outline',
    },
    {
      status: 'OUT_FOR_DELIVERY',
      titleKey: 'order.steps.outForDelivery.title',
      descriptionKey: 'order.steps.outForDelivery.description',
      icon: 'walk-outline',
    },
    {
      status: 'DELIVERED',
      titleKey: 'order.steps.delivered.delivery.title',
      descriptionKey: 'order.steps.delivered.delivery.description',
      icon: 'checkmark-circle-outline',
    },
  ],

  PICKUP: [
    ...COMMON_STEPS,
    {
      status: 'READY',
      titleKey: 'order.steps.ready.pickup.title',
      descriptionKey: 'order.steps.ready.pickup.description',
      icon: 'time-outline',
    },
    {
      status: 'DELIVERED',
      titleKey: 'order.steps.delivered.pickup.title',
      descriptionKey: 'order.steps.delivered.pickup.description',
      icon: 'checkmark-circle-outline',
    },
  ],
} as const;

const DEFAULT_STATUS_LABEL_KEYS: Record<OrderStatus, string> = {
  PENDING: 'order.status.pending',
  CONFIRMED: 'order.status.confirmed',
  PREPARING: 'order.status.preparing',
  READY: 'order.status.ready.delivery',
  OUT_FOR_DELIVERY: 'order.status.outForDelivery',
  DELIVERED: 'order.status.delivered.delivery',
  CANCELLED: 'order.status.cancelled',
  REJECTED: 'order.status.rejected',
};

const STATUS_LABEL_KEYS_BY_TYPE: Partial<
  Record<OrderStatus, Partial<Record<OrderType, string>>>
> = {
  READY: {
    PICKUP: 'order.status.ready.pickup',
    DELIVERY: 'order.status.ready.delivery',
  },
  DELIVERED: {
    PICKUP: 'order.status.delivered.pickup',
    DELIVERY: 'order.status.delivered.delivery',
  },
};

export function getOrderSteps(orderType?: OrderType | null): OrderStep[] {
  return ORDER_STEPS_BY_TYPE[orderType ?? 'DELIVERY'];
}

export function getOrderStatusLabelKey(
  status?: OrderStatus | null,
  orderType?: OrderType | null
): string {
  if (!status) return 'order.status.default';

  const type = orderType ?? 'DELIVERY';

  const custom = STATUS_LABEL_KEYS_BY_TYPE[status]?.[type];
  if (custom) return custom;

  return DEFAULT_STATUS_LABEL_KEYS[status] ?? 'order.status.default';
}
