package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleContext;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;

public interface RestaurantRuleHandler {

  RuleType type();

  boolean matches(
    EffectiveRestaurantRule rule,
    RuleContext context
  );

  EffectiveOptionGroupRules apply(
    EffectiveRestaurantRule rule,
    EffectiveOptionGroupRules currentRules
  );
}
