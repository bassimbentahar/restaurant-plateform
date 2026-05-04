package com.restaurant.restaurantbackend.restaurant.delivery.zone.dto;

import java.math.BigDecimal;

public record DeliveryValidationResponse(
  boolean deliverable,
  BigDecimal deliveryFee,
  BigDecimal minOrderAmount,
  String zoneName,
  String reason
) {}
