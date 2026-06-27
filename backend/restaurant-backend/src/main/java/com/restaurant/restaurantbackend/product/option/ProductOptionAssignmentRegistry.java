package com.restaurant.restaurantbackend.product.option;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class ProductOptionAssignmentRegistry {

  private final Map<String, OptionGroup> optionGroupsByClientId =
    new HashMap<>();

  public void registerOptionGroup(
    String clientId,
    OptionGroup optionGroup
  ) {
    if (clientId == null || clientId.isBlank() || optionGroup == null) {
      return;
    }

    OptionGroup existing = optionGroupsByClientId.get(clientId);

    if (existing != null && !sameOptionGroup(existing, optionGroup)) {
      throw new IllegalArgumentException(
        "Duplicate optionGroup clientId with different option groups: " + clientId
      );
    }

    optionGroupsByClientId.put(clientId, optionGroup);
  }

  public OptionGroup findOptionGroup(String clientId) {
    if (clientId == null || clientId.isBlank()) {
      return null;
    }

    return optionGroupsByClientId.get(clientId);
  }

  public ProductOptionAssignmentResult toResult() {
    return new ProductOptionAssignmentResult(optionGroupsByClientId);
  }

  private boolean sameOptionGroup(
    OptionGroup first,
    OptionGroup second
  ) {
    if (first == second) {
      return true;
    }

    if (first == null || second == null) {
      return false;
    }

    if (first.getId() == null || second.getId() == null) {
      return false;
    }

    return Objects.equals(first.getId(), second.getId());
  }
}
