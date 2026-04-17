package com.restaurant.restaurantbackend.product.dto.request;

import java.util.List;

public record ProductOptionGroupRequest(
  String name,
  String description,
  Integer minSelections,
  Integer maxSelections,
  boolean required,
  Integer displayOrder,
  List<ProductOptionItemRequest> items
) {
}
