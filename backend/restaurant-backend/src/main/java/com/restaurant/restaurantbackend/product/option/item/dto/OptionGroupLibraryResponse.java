package com.restaurant.restaurantbackend.product.option.item.dto;

import java.util.List;
import java.util.UUID;

public record OptionGroupLibraryResponse(
  UUID id,
  String name,
  String description,
  Boolean required,
  Integer minSelections,
  Integer maxSelections,
  Integer usedInProductCount,
  List<OptionItemLibraryResponse> items
) {
}
