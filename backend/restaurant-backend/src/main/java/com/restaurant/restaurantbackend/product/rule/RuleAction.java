package com.restaurant.restaurantbackend.product.rule;

import java.math.BigDecimal;

public record RuleAction(
  Boolean visible,
  Boolean available,
  Boolean required,
  Integer minSelections,
  Integer maxSelections,
  Integer includedSelections,
  BigDecimal priceDeltaOverride
) {}
