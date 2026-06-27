package com.restaurant.restaurantbackend.product.dto.response.admin;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductEditOptionItemResponse(
  UUID id,
  UUID optionItemId,
  String name,
  String description,
  BigDecimal priceDelta,
  Boolean isAvailable,
  Integer displayOrder
) {}
