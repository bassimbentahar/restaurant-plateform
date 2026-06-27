package com.restaurant.restaurantbackend.product.dto.response.admin;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.util.RuleType;

import java.util.List;
import java.util.UUID;

public record ProductEditRuleResponse(
  UUID id,
  UUID sourceRuleId,

  String name,
  String description,

  Boolean enabled,
  Boolean favorite,
  Boolean reusable,

  Boolean customerVisible,
  String customerTitle,
  String customerDescription,

  List<String> tags,

  RuleType type,

  /*
   * Pas une colonne en base.
   * Valeur calculée depuis RuleCondition :
   * RESTAURANT, PRODUCT, VARIANT, OPTION_GROUP, OPTION_ITEM
   */
  String targetType,

  String variantClientId,
  String optionGroupClientId,
  UUID optionItemId,

  RuleCondition condition,
  RuleAction action,

  Integer priority
) {}
