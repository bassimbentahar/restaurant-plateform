package com.restaurant.restaurantbackend.product.dto.response;

import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
  UUID id,
  String sku,
  String slug,
  String title,
  String shortDescription,
  String description,
  String thumb,
  BigDecimal basePrice,
  Boolean isAvailable,
  Boolean isFeatured,
  Boolean isArchived,
  Integer preparationTimeMinutes,
  LocalTime availableFrom,
  LocalTime availableTo,
  Integer calories,
  String ingredientsText,
  String allergensText,
  ProductCategoryResponse category,
  List<ProductImageResponse> images,
  List<ProductVariantResponse> variants,
  List<ProductOptionGroupResponse> optionGroups,
  LocalDateTime createdAt,
  LocalDateTime updatedAt
) {}
