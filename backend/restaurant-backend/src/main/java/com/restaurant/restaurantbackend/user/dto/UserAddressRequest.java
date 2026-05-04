package com.restaurant.restaurantbackend.user.dto;

import java.math.BigDecimal;

public record UserAddressRequest(
  String label,
  String street,
  String streetNumber,
  String postalCode,
  String city,
  String country,
  String instructions,
  boolean defaultAddress,
  BigDecimal latitude,
  BigDecimal longitude
) {}
