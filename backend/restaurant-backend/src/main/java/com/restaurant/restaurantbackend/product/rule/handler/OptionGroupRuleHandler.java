package com.restaurant.restaurantbackend.product.rule.handler;


import com.restaurant.restaurantbackend.product.rule.OptionGroupRule;
import com.restaurant.restaurantbackend.product.rule.RuleContext;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;

public interface OptionGroupRuleHandler {

  RuleType type();

  boolean matches(OptionGroupRule rule, RuleContext context);

  EffectiveOptionGroupRules apply(
    OptionGroupRule rule,
    EffectiveOptionGroupRules currentRules
  );
}
