package com.restaurant.restaurantbackend.product.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ProductImageRequest(
  String url,
  String altText,
  Integer displayOrder,

  @JsonProperty("primary")
  Boolean primary
) {
}
