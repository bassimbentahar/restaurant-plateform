package com.restaurant.restaurantbackend.product.variant.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductVariantRequest(
  String clientId,
  String name,
  String sku,
  BigDecimal priceAdjustment,
  BigDecimal compareAtPrice,
  Boolean isDefault,
  Boolean isAvailable,
  Integer displayOrder,
  List<VariantOptionGroupAssignmentRequest> optionGroups
) {
}
