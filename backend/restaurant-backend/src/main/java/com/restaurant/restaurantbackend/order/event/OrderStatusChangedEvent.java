package com.restaurant.restaurantbackend.order.event;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusChangedEvent(
  UUID orderId,
  UUID restaurantId,
  UUID userId,
  String orderNumber,
  String oldStatus,
  String newStatus,
  Instant changedAt
) {}
