package com.restaurant.restaurantbackend.restaurant.delivery.zone.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record DeliveryZoneResponse(
  UUID id,
  UUID restaurantId,
  String name,
  BigDecimal deliveryFee,
  BigDecimal minOrderAmount,
  boolean enabled,
  String polygonWkt
) {}
