package com.restaurant.restaurantbackend.product.option;

import java.util.Map;

public record ProductOptionAssignmentResult(
  Map<String, OptionGroup> optionGroupsByClientId
) {
  public ProductOptionAssignmentResult {
    optionGroupsByClientId = optionGroupsByClientId == null
      ? Map.of()
      : Map.copyOf(optionGroupsByClientId);
  }
}
