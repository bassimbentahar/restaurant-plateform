package com.restaurant.restaurantbackend.product.dto.response;

import java.util.List;
import java.util.UUID;

public record ProductOptionGroupResponse(
  UUID id,
  String name,
  String description,
  Integer minSelections,
  Integer maxSelections,
  boolean required,
  Integer displayOrder,
  List<ProductOptionItemResponse> items
) {
}
