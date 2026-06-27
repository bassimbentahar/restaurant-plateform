package com.restaurant.restaurantbackend.product.rule;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record RuleContext(
  UUID productId,
  UUID variantId,
  UUID optionGroupId,
  String variantName,
  String orderType,
  LocalTime currentTime,
  DayOfWeek dayOfWeek,
  List<UUID> selectedOptionIds
) {}
