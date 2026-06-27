package com.restaurant.restaurantbackend.product.variant.dto;

import java.util.UUID;

public record VariantOptionGroupAssignmentRequest(
  UUID optionGroupId,
  String optionGroupClientId,
  Boolean requiredOverride,
  Integer minSelectOverride,
  Integer maxSelectOverride,
  Integer includedSelectionsOverride,
  Integer displayOrder
) {}
