package com.restaurant.restaurantbackend.product.rule.dto;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.util.RuleTargetType;
import com.restaurant.restaurantbackend.product.util.RuleType;

import java.util.UUID;

public record ProductRuleRequest(
  UUID sourceRuleId,

  String name,
  String description,

  boolean enabled,
  boolean favorite,
  boolean reusable,

  boolean customerVisible,
  String customerTitle,
  String customerDescription,

  RuleType type,
  RuleTargetType targetType,

  String variantClientId,
  String optionGroupClientId,
  UUID optionItemId,

  RuleCondition condition,
  RuleAction action,

  Integer priority
) {}
