export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  orderType: 'PICKUP' | 'DELIVERY';
  total: number;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface CreateOrderRequest {
  restaurantId: string;

  addressId?: string | null;

  orderType: 'DELIVERY' | 'PICKUP';

  deliveryTimeType: 'ASAP' | 'SCHEDULED';
  scheduledDate?: string | null;
  scheduledTime?: string | null;

  customerFirstname: string;
  customerLastname: string;
  customerPhone: string;

  note?: string;

  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;

  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: string;
  productName: string;

  variantId?: string | null;
  variantName?: string | null;

  quantity: number;

  baseUnitPrice: number;
  unitFinalPrice: number;
  lineTotalPrice: number;

  specialInstructions?: string;

  options: CreateOrderItemOptionRequest[];
}

export interface CreateOrderItemOptionRequest {
  optionGroupId?: string | null;
  optionGroupName: string;

  optionItemId?: string | null;
  optionName: string;

  priceDelta: number;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  restaurantId: string;
  userId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  changedAt: string;
}

