package com.restaurant.restaurantbackend.product.image.dto;

import java.util.UUID;

public record ProductImageResponse(
  UUID id,
  String url,
  String alt,
  Boolean isPrimary,
  Integer sortOrder
) {}

