package com.restaurant.restaurantbackend.product.dto.request;

import com.restaurant.restaurantbackend.product.ProductStatus;
import com.restaurant.restaurantbackend.product.rule.dto.ProductRuleRequest;
import com.restaurant.restaurantbackend.product.variant.dto.ProductVariantRequest;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record ProductCreateRequest(
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
  List<UUID> categoryIds,
  List<ProductImageRequest> images,
  List<ProductOptionGroupAssignmentRequest> optionGroups,
  List<ProductVariantRequest> variants,
  List<ProductRuleRequest> rules

) {
}
