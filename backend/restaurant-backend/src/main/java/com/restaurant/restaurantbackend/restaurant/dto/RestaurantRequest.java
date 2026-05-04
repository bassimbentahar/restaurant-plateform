package com.restaurant.restaurantbackend.restaurant.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record RestaurantRequest(
  @NotBlank String name,
  @NotBlank String slug,
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
  Boolean active,
  Boolean open,
  Boolean supportsDelivery,
  Boolean supportsPickup
) {}
