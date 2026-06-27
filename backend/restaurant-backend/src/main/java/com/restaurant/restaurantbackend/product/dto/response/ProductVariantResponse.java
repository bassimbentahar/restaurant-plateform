package com.restaurant.restaurantbackend.product.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductVariantResponse(
  UUID id,
  String name,
  String sku,
  BigDecimal basePrice,
  BigDecimal compareAtPrice,
  boolean isDefault,
  boolean isAvailable,
  Integer sortOrder,
  List<ProductOptionGroupResponse> optionGroups
) {
}
