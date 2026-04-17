package com.restaurant.restaurantbackend.product.category.dto;

import java.util.UUID;

public record ProductCategorySummaryResponse(
  UUID id,
  String name,
  String slug
) {
}
