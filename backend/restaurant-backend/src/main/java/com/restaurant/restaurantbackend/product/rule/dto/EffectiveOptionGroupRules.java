package com.restaurant.restaurantbackend.product.rule.dto;

import java.math.BigDecimal;

public record EffectiveOptionGroupRules(
  boolean required,
  Integer minSelections,
  Integer maxSelections,
  boolean visible,
  boolean available,
  BigDecimal priceDeltaOverride,
  Integer freeSelections
) {}
