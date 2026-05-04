package com.restaurant.restaurantbackend.restaurant.delivery.zone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DeliveryZoneRequest(
  @NotBlank String name,
  @NotNull BigDecimal deliveryFee,
  @NotNull BigDecimal minOrderAmount,
  Boolean enabled,

  /**
   * WKT polygon example:
   * POLYGON((6.62 46.51, 6.65 46.51, 6.65 46.53, 6.62 46.53, 6.62 46.51))
   */
  @NotBlank String polygonWkt
) {}
