package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.util.RuleTargetType;
import com.restaurant.restaurantbackend.product.util.RuleType;

import java.util.UUID;

public record EffectiveRestaurantRule(
  UUID ruleId,
  String name,
  String description,

  boolean customerVisible,
  String customerTitle,
  String customerDescription,

  RuleType ruleType,
  RuleTargetType targetType,

  UUID categoryId,
  UUID productId,
  UUID variantId,
  UUID optionGroupId,
  UUID optionItemId,

  int priority,

  RuleCondition condition,
  RuleAction action
) {}
