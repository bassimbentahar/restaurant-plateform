package com.restaurant.restaurantbackend.product.dto.response;

import com.restaurant.restaurantbackend.product.category.dto.ProductCategorySummaryResponse;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryResponse(
  UUID id,
  String slug,
  String title,
  String shortDescription,
  String thumb,
  BigDecimal basePrice,
  boolean isAvailable,
  boolean isFeatured,
  ProductCategorySummaryResponse category
) {
}
