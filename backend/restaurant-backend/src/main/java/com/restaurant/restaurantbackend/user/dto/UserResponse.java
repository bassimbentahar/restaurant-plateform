package com.restaurant.restaurantbackend.user.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
  UUID id,
  String keycloakId,
  String email,
  String firstname,
  String lastname,
  String fullName,
  LocalDate dateOfBirth,
  String phone,
  boolean enabled,
  boolean deleted,
  LocalDateTime createdDate,
  LocalDateTime lastModifiedDate
) {}
