package com.restaurant.restaurantbackend.product.image.dto;

  public record ProductImageUploadResponse(
    String path,
    String url,
    String filename,
    String contentType,
    long sizeBytes
  ) {}
