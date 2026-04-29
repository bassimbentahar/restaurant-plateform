package com.restaurant.restaurantbackend.user.dto;

import java.time.LocalDate;

public record UserRequest(
  String firstname,
  String lastname,
  LocalDate dateOfBirth,
  String phone
) {}
