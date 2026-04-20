package com.restaurant.restaurantbackend.product.category.dto;

import java.util.UUID;

public record ProductCategoryResponse(
  UUID id,
  String name,
  String slug
) {
}
