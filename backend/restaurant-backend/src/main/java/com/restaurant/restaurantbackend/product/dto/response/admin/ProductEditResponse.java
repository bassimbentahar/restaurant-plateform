package com.restaurant.restaurantbackend.product.dto.response.admin;

import com.restaurant.restaurantbackend.product.ProductStatus;
import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;
import com.restaurant.restaurantbackend.product.image.dto.ProductImageResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record ProductEditResponse(
  UUID id,
  String sku,
  String slug,
  String title,
  String shortDescription,
  String description,
  String thumb,
  ProductStatus status,

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

  List<ProductCategoryResponse> categories,
  List<ProductImageResponse> images,

  List<ProductEditOptionGroupResponse> optionGroups,
  List<ProductEditVariantResponse> variants,
  List<ProductEditRuleResponse> rules,

  LocalDateTime createdAt,
  LocalDateTime updatedAt
) {}
