package com.restaurant.restaurantbackend.restaurant.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record NearbyRestaurantResponse(
  UUID id,
  String name,
  String slug,
  String description,
  String city,
  BigDecimal latitude,
  BigDecimal longitude,
  boolean open,
  boolean supportsDelivery,
  boolean supportsPickup,
  BigDecimal averageRating,
  int totalReviews,
  double distanceKm
) {}
