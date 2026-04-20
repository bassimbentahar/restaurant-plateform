package com.restaurant.restaurantbackend.product.dto.response;

import java.util.List;
import java.util.UUID;

public record ProductOptionGroupResponse(
  UUID id,
  String name,
  String description,
  String displayType,
  boolean required,
  boolean multiple,
  Integer minSelect,
  Integer maxSelect,
  Boolean isAvailable,
  Integer sortOrder,
  List<ProductOptionItemResponse> options
) {}
