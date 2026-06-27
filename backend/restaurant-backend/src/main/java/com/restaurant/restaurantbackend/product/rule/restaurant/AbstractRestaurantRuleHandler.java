package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.rule.RuleContext;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public abstract class AbstractRestaurantRuleHandler implements RestaurantRuleHandler {

  @Override
  public boolean matches(
    EffectiveRestaurantRule rule,
    RuleContext context
  ) {
    RuleCondition condition = rule.condition();

    if (condition == null) {
      return true;
    }

    return matchesUuid(condition.productId(), context.productId())
      && matchesUuid(condition.variantId(), context.variantId())
      && matchesUuid(condition.optionGroupId(), context.optionGroupId())
      && matchesOrderType(condition.orderType(), context.orderType())
      && matchesDayOfWeek(condition.daysOfWeek(), context.dayOfWeek())
      && matchesTimeRange(condition.timeFrom(), condition.timeTo(), context.currentTime())
      && matchesSelectedOption(condition.selectedOptionItemIds(), context.selectedOptionIds());
  }

  private boolean matchesUuid(UUID expected, UUID actual) {
    if (expected == null) {
      return true;
    }

    return Objects.equals(expected, actual);
  }

  private boolean matchesOrderType(String expected, String actual) {
    if (expected == null || expected.isBlank()) {
      return true;
    }

    return Objects.equals(expected, actual);
  }

  private boolean matchesDayOfWeek(
    List<DayOfWeek> expectedDays,
    DayOfWeek actual
  ) {
    if (expectedDays == null || expectedDays.isEmpty()) {
      return true;
    }

    if (actual == null) {
      return false;
    }

    return expectedDays.contains(actual);
  }

  private boolean matchesTimeRange(
    String timeFrom,
    String timeTo,
    LocalTime currentTime
  ) {
    if (isBlank(timeFrom) && isBlank(timeTo)) {
      return true;
    }

    if (currentTime == null) {
      return false;
    }

    LocalTime from = parseTimeOrDefault(timeFrom, LocalTime.MIN);
    LocalTime to = parseTimeOrDefault(timeTo, LocalTime.MAX);

    return !currentTime.isBefore(from) && !currentTime.isAfter(to);
  }

  private LocalTime parseTimeOrDefault(
    String value,
    LocalTime defaultValue
  ) {
    if (isBlank(value)) {
      return defaultValue;
    }

    try {
      return LocalTime.parse(value);
    } catch (DateTimeParseException exception) {
      throw new IllegalArgumentException(
        "Invalid rule time format. Expected HH:mm but got: " + value,
        exception
      );
    }
  }

  private boolean matchesSelectedOption(
    List<UUID> expectedOptionIds,
    List<UUID> selectedOptionIds
  ) {
    if (expectedOptionIds == null || expectedOptionIds.isEmpty()) {
      return true;
    }

    if (selectedOptionIds == null || selectedOptionIds.isEmpty()) {
      return false;
    }

    return selectedOptionIds.stream()
      .anyMatch(expectedOptionIds::contains);
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
