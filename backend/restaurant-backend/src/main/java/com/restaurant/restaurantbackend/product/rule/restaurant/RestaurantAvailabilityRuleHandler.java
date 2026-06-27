package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

@Component
public class RestaurantAvailabilityRuleHandler extends AbstractRestaurantRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.AVAILABILITY;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    EffectiveRestaurantRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    RuleAction action = rule.action();

    if (action == null || action.available() == null) {
      return currentRules;
    }

    return new EffectiveOptionGroupRules(
      currentRules.required(),
      currentRules.minSelections(),
      currentRules.maxSelections(),
      currentRules.visible(),
      action.available(),
      currentRules.priceDeltaOverride(),
      currentRules.freeSelections()
    );
  }
}
