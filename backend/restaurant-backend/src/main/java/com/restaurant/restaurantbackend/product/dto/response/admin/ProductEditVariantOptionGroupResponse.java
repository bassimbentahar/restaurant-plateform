package com.restaurant.restaurantbackend.product.dto.response.admin;

import java.util.UUID;

public record ProductEditVariantOptionGroupResponse(
  UUID id,
  UUID optionGroupId,
  String optionGroupClientId,

  Boolean requiredOverride,
  Integer minSelectOverride,
  Integer maxSelectOverride,
  Integer includedSelectionsOverride,
  Integer displayOrder
) {}
