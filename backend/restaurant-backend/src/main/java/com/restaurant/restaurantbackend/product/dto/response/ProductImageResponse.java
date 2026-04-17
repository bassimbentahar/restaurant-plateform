package com.restaurant.restaurantbackend.product.dto.response;

public record ProductImageResponse(
  String url,
  String altText,
  Integer displayOrder,
  boolean isPrimary
) {
}
