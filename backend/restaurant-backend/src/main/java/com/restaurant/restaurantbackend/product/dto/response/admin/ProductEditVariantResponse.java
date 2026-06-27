package com.restaurant.restaurantbackend.product.dto.response.admin;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductEditVariantResponse(
  UUID id,
  String clientId,
  String name,
  String sku,
  BigDecimal priceAdjustment,
  BigDecimal compareAtPrice,
  Boolean isDefault,
  Boolean isAvailable,
  Integer displayOrder,
  List<ProductEditVariantOptionGroupResponse> optionGroups
) {}
