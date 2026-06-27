package com.restaurant.restaurantbackend.product.rule.restaurant.dto;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.util.RuleType;

import java.util.List;

public record RestaurantRuleCreateRequest(
  String name,
  String description,
  RuleType type,
  Boolean active,
  Boolean favorite,
  Boolean reusable,
  Boolean customerVisible,
  String customerTitle,
  String customerDescription,
  RuleCondition condition,
  RuleAction action,
  List<String> tags
) {
}
