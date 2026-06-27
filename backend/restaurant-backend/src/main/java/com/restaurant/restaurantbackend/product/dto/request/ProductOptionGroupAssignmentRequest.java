package com.restaurant.restaurantbackend.product.dto.request;

import com.restaurant.restaurantbackend.product.option.item.dto.ProductOptionItemOverrideRequest;

import java.util.List;
import java.util.UUID;

public record ProductOptionGroupAssignmentRequest(
  String clientId,
  UUID optionGroupId,
  String name,
  String description,
  Boolean requiredOverride,
  Integer minSelectOverride,
  Integer maxSelectOverride,
  Integer displayOrder,
  List<ProductOptionItemRequest> items,
  List<ProductOptionItemOverrideRequest> optionItemOverrides
) {
}
