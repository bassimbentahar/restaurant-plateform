package com.restaurant.restaurantbackend.product.dto.response.admin;

import java.util.List;
import java.util.UUID;

public record ProductEditOptionGroupResponse(
  UUID id,
  String clientId,

  UUID optionGroupId,
  String name,
  String description,

  Boolean requiredOverride,
  Integer minSelectOverride,
  Integer maxSelectOverride,
  Integer displayOrder,

  List<ProductEditOptionItemResponse> items,
  List<ProductEditOptionItemOverrideResponse> optionItemOverrides
) {}
