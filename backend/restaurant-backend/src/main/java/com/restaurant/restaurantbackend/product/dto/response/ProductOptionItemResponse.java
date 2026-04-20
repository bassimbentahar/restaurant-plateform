package com.restaurant.restaurantbackend.product.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductOptionItemResponse(
  UUID id,
  String name,
  String description,
  BigDecimal priceDelta,
  boolean isDefault,
  boolean isAvailable,
  Integer sortOrder
) {
}
