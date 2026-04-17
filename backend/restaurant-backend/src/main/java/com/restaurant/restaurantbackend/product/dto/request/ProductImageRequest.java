package com.restaurant.restaurantbackend.product.dto.request;

public record ProductImageRequest(
  String url,
  String altText,
  Integer displayOrder,
  boolean isPrimary
) {
}
