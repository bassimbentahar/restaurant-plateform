package com.restaurant.restaurantbackend.product.dto.request;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

public record ProductCreateRequest(
  String sku,
  String slug,
  String title,
  String shortDescription,
  String description,
  String thumb,
  BigDecimal basePrice,
  boolean isAvailable,
  boolean isFeatured,
  boolean isArchived,
  Integer preparationTimeMinutes,
  LocalTime availableFrom,
  LocalTime availableTo,
  Integer calories,
  String ingredientsText,
  String allergensText,
  String categoryId,
  List<ProductImageRequest> images,
  List<ProductVariantRequest> variants,
  List<ProductOptionGroupRequest> optionGroups
) {
}
