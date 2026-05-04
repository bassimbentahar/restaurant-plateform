package com.restaurant.restaurantbackend.restaurant.dto;

import java.math.BigDecimal;
import java.util.UUID;

public interface NearbyRestaurantProjection {
  UUID getId();
  String getName();
  String getSlug();
  String getDescription();
  String getCity();
  BigDecimal getLatitude();
  BigDecimal getLongitude();
  Boolean getOpen();
  Boolean getSupportsDelivery();
  Boolean getSupportsPickup();
  BigDecimal getAverageRating();
  Integer getTotalReviews();
  Double getDistanceKm();
}
