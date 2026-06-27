package com.restaurant.restaurantbackend.product.rule.restaurant.dto;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.util.RuleType;

import java.util.List;
import java.util.UUID;

public record RestaurantRuleResponse(
  UUID id,
  String name,
  String description,
  RuleType type,
  boolean active,
  boolean favorite,
  boolean reusable,
  boolean customerVisible,
  String customerTitle,
  String customerDescription,
  RuleCondition condition,
  RuleAction action,
  List<RuleTagResponse> tags
) {
}
