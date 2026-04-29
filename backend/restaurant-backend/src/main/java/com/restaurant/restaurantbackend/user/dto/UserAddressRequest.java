package com.restaurant.restaurantbackend.user.dto;

public record UserAddressRequest(
  String label,
  String street,
  String streetNumber,
  String postalCode,
  String city,
  String country,
  String instructions,
  boolean defaultAddress
) {}
