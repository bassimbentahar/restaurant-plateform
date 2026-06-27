package com.restaurant.restaurantbackend.product.rule.handler;

import com.restaurant.restaurantbackend.product.rule.OptionGroupRule;
import com.restaurant.restaurantbackend.product.rule.RuleContext;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public abstract class AbstractOptionGroupRuleHandler implements OptionGroupRuleHandler {

  @Override
  public boolean matches(OptionGroupRule rule, RuleContext context) {
    Map<String, Object> conditions = rule.getConditionJson();

    if (conditions == null || conditions.isEmpty()) {
      return true;
    }

    return matchesString(conditions, "variantName", context.variantName())
      && matchesString(conditions, "orderType", context.orderType())
      && matchesUuid(conditions, "productId", context.productId())
      && matchesUuid(conditions, "variantId", context.variantId())
      && matchesUuid(conditions, "optionGroupId", context.optionGroupId())
      && matchesDayOfWeek(conditions, context.dayOfWeek())
      && matchesTimeRange(conditions, context.currentTime())
      && matchesSelectedOption(conditions, context.selectedOptionIds());
  }

  protected Boolean getBoolean(Map<String, Object> json, String key) {
    Object value = json.get(key);
    return value instanceof Boolean b ? b : null;
  }

  protected Integer getInteger(Map<String, Object> json, String key) {
    Object value = json.get(key);

    if (value instanceof Integer i) return i;
    if (value instanceof Number n) return n.intValue();

    return null;
  }

  protected BigDecimal getBigDecimal(Map<String, Object> json, String key) {
    Object value = json.get(key);

    if (value instanceof BigDecimal b) return b;
    if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
    if (value instanceof String s) return new BigDecimal(s);

    return null;
  }

  private boolean matchesString(Map<String, Object> conditions, String key, String actual) {
    Object expected = conditions.get(key);

    if (expected == null) return true;
    if (actual == null) return false;

    return Objects.equals(expected.toString(), actual);
  }

  private boolean matchesUuid(Map<String, Object> conditions, String key, UUID actual) {
    Object expected = conditions.get(key);

    if (expected == null) return true;
    if (actual == null) return false;

    return Objects.equals(expected.toString(), actual.toString());
  }

  @SuppressWarnings("unchecked")
  private boolean matchesDayOfWeek(Map<String, Object> conditions, DayOfWeek actual) {
    Object expected = conditions.get("dayOfWeek");

    if (expected == null) return true;
    if (actual == null) return false;

    if (expected instanceof List<?> days) {
      return days.stream().anyMatch(day -> day.toString().equalsIgnoreCase(actual.name()));
    }

    return expected.toString().equalsIgnoreCase(actual.name());
  }

  private boolean matchesTimeRange(Map<String, Object> conditions, LocalTime currentTime) {
    Object from = conditions.get("timeFrom");
    Object to = conditions.get("timeTo");

    if (from == null && to == null) return true;
    if (currentTime == null) return false;

    LocalTime timeFrom = from != null ? LocalTime.parse(from.toString()) : LocalTime.MIN;
    LocalTime timeTo = to != null ? LocalTime.parse(to.toString()) : LocalTime.MAX;

    return !currentTime.isBefore(timeFrom) && !currentTime.isAfter(timeTo);
  }

  private boolean matchesSelectedOption(Map<String, Object> conditions, List<UUID> selectedOptionIds) {
    Object expected = conditions.get("selectedOptionId");

    if (expected == null) return true;
    if (selectedOptionIds == null || selectedOptionIds.isEmpty()) return false;

    return selectedOptionIds.stream()
      .anyMatch(id -> id.toString().equals(expected.toString()));
  }
}
