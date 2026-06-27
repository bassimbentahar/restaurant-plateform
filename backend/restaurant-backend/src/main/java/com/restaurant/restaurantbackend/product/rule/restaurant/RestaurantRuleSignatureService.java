package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.rule.dto.ProductRuleRequest;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleCreateRequest;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleUpdateRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

@Service
public class RestaurantRuleSignatureService {

  public String fromProductRuleRequest(ProductRuleRequest rule) {
    if (rule == null) {
      return "rule:null";
    }

    return String.join("|",
      "type=" + normalize(rule.type()),
      "targetType=" + normalize(rule.targetType()),
      "variantClientId=" + normalize(rule.variantClientId()),
      "optionGroupClientId=" + normalize(rule.optionGroupClientId()),
      "optionItemId=" + normalize(rule.optionItemId()),
      "condition=" + fromCondition(rule.condition()),
      "action=" + fromAction(rule.action())
    );
  }

  public String fromCreateRequest(RestaurantRuleCreateRequest request) {
    if (request == null) {
      return "rule:null";
    }

    return String.join("|",
      "type=" + normalize(request.type()),
      "condition=" + fromCondition(request.condition()),
      "action=" + fromAction(request.action())
    );
  }

  public String fromUpdateRequest(
    RestaurantRule currentRule,
    RestaurantRuleUpdateRequest request
  ) {
    if (currentRule == null) {
      return "rule:null";
    }

    RuleCondition effectiveCondition = request.condition() != null
      ? request.condition()
      : currentRule.getCondition();

    RuleAction effectiveAction = request.action() != null
      ? request.action()
      : currentRule.getAction();

    Object effectiveType = request.type() != null
      ? request.type()
      : currentRule.getRuleType();

    return String.join("|",
      "type=" + normalize(effectiveType),
      "condition=" + fromCondition(effectiveCondition),
      "action=" + fromAction(effectiveAction)
    );
  }

  public String fromEntity(RestaurantRule rule) {
    if (rule == null) {
      return "rule:null";
    }

    return String.join("|",
      "type=" + normalize(rule.getRuleType()),
      "condition=" + fromCondition(rule.getCondition()),
      "action=" + fromAction(rule.getAction())
    );
  }

  private String fromCondition(RuleCondition condition) {
    if (condition == null) {
      return "condition:null";
    }

    return String.join(";",
      "productId=" + normalize(condition.productId()),
      "variantId=" + normalize(condition.variantId()),
      "optionGroupId=" + normalize(condition.optionGroupId()),
      "optionItemId=" + normalize(condition.optionItemId()),
      "orderType=" + normalize(condition.orderType()),
      "daysOfWeek=" + normalizeDays(condition.daysOfWeek()),
      "timeFrom=" + normalizeTime(condition.timeFrom()),
      "timeTo=" + normalizeTime(condition.timeTo()),
      "selectedOptions=" + normalizeUuidList(condition.selectedOptionItemIds())
    );
  }

  private String fromAction(RuleAction action) {
    if (action == null) {
      return "action:null";
    }

    return String.join(";",
      "visible=" + normalize(action.visible()),
      "available=" + normalize(action.available()),
      "required=" + normalize(action.required()),
      "minSelections=" + normalize(action.minSelections()),
      "maxSelections=" + normalize(action.maxSelections()),
      "includedSelections=" + normalize(action.includedSelections()),
      "priceDeltaOverride=" + normalizeNumber(action.priceDeltaOverride())
    );
  }

  private String normalize(Object value) {
    if (value == null) {
      return "null";
    }

    return value.toString()
      .trim()
      .toLowerCase();
  }

  private String normalizeTime(String value) {
    if (value == null || value.isBlank()) {
      return "null";
    }

    return value.trim();
  }

  private String normalizeDays(List<DayOfWeek> days) {
    if (days == null || days.isEmpty()) {
      return "[]";
    }

    return days.stream()
      .sorted()
      .map(DayOfWeek::name)
      .toList()
      .toString();
  }

  private String normalizeUuidList(List<UUID> ids) {
    if (ids == null || ids.isEmpty()) {
      return "[]";
    }

    return ids.stream()
      .map(UUID::toString)
      .sorted()
      .toList()
      .toString();
  }

  private String normalizeNumber(Object value) {
    if (value == null) {
      return "null";
    }

    if (value instanceof BigDecimal bigDecimal) {
      return bigDecimal.stripTrailingZeros().toPlainString();
    }

    return value.toString().trim();
  }
}
