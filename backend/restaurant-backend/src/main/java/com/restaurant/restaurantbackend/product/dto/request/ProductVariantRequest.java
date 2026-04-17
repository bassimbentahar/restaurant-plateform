package com.restaurant.restaurantbackend.product.dto.request;

import java.math.BigDecimal;

public record ProductVariantRequest(
  String name,
  String sku,
  BigDecimal priceAdjustment,
  boolean isDefault,
  boolean isAvailable,
  Integer displayOrder
) {
}
