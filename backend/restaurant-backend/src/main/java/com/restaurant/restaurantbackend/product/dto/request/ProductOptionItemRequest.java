package com.restaurant.restaurantbackend.product.dto.request;

import java.math.BigDecimal;

public record ProductOptionItemRequest(
  String name,
  String description,
  BigDecimal priceAdjustment,
  boolean isDefault,
  boolean isAvailable,
  Integer displayOrder
) {
}
