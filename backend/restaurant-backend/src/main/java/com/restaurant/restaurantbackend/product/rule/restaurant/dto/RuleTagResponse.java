package com.restaurant.restaurantbackend.product.rule.restaurant.dto;

import java.util.UUID;

public record RuleTagResponse(
  UUID id,
  String name,
  String color
) {
}
