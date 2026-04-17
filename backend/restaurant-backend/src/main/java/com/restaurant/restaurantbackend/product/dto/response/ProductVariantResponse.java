package com.restaurant.restaurantbackend.product.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductVariantResponse(
  UUID id,
  String name,
  String sku,
  BigDecimal priceAdjustment,
  boolean isDefault,
  boolean isAvailable,
  Integer displayOrder
) {
}
