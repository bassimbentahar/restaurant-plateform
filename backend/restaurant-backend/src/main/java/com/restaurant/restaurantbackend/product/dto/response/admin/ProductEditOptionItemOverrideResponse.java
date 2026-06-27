package com.restaurant.restaurantbackend.product.dto.response.admin;

import java.util.UUID;

public record ProductEditOptionItemOverrideResponse(
  UUID optionItemId,
  Boolean visible
) {}
