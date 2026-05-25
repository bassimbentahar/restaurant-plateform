package com.restaurant.restaurantbackend.order.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCreatedEvent(
  UUID orderId,
  UUID restaurantId,
  UUID userId,
  String orderNumber,
  BigDecimal total,
  Instant createdAt
) {}
