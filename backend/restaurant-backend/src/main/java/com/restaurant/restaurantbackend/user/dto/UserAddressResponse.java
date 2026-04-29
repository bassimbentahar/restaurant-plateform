package com.restaurant.restaurantbackend.user.dto;

import java.util.UUID;

public record UserAddressResponse(
  UUID id,
  String label,
  String street,
  String streetNumber,
  String postalCode,
  String city,
  String country,
  String instructions,
  boolean defaultAddress
) {}
