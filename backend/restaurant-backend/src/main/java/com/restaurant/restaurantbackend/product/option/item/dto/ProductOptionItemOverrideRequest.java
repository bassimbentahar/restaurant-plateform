package com.restaurant.restaurantbackend.product.option.item.dto;

import java.util.UUID;

public record ProductOptionItemOverrideRequest(
  UUID optionItemId,
  Boolean visible
) {
}
