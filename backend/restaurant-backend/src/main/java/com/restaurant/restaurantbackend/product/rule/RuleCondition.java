package com.restaurant.restaurantbackend.product.rule;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record RuleCondition(
  UUID productId,
  UUID variantId,
  UUID optionGroupId,
  UUID optionItemId,
  String orderType,
  List<DayOfWeek> daysOfWeek,
  String timeFrom,
  String timeTo,
  List<UUID> selectedOptionItemIds
) {}
