package com.restaurant.restaurantbackend.product.option.item.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OptionItemLibraryResponse(
  UUID id,
  String name,
  String description,
  BigDecimal priceDelta,
  Boolean isAvailable,
  Integer displayOrder
) {
}
