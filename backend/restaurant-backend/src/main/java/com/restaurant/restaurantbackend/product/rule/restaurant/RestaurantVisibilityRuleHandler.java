package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

@Component
public class RestaurantVisibilityRuleHandler extends AbstractRestaurantRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.VISIBILITY;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    EffectiveRestaurantRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    RuleAction action = rule.action();

    if (action == null || action.visible() == null) {
      return currentRules;
    }

    return new EffectiveOptionGroupRules(
      currentRules.required(),
      currentRules.minSelections(),
      currentRules.maxSelections(),
      action.visible(),
      currentRules.available(),
      currentRules.priceDeltaOverride(),
      currentRules.freeSelections()
    );
  }
}
