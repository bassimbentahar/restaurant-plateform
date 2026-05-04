package com.restaurant.restaurantbackend.restaurant.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RestaurantResponse(
  UUID id,
  String name,
  String slug,
  String description,
  String phone,
  String email,
  String street,
  String streetNumber,
  String postalCode,
  String city,
  String country,
  BigDecimal latitude,
  BigDecimal longitude,
  boolean active,
  boolean open,
  boolean supportsDelivery,
  boolean supportsPickup,
  BigDecimal averageRating,
  int totalReviews
) {}
