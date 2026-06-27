package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

@Component
public class RestaurantSelectionRuleHandler extends AbstractRestaurantRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.SELECTION_RULE;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    EffectiveRestaurantRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    RuleAction action = rule.action();

    if (action == null) {
      return currentRules;
    }

    return new EffectiveOptionGroupRules(
      action.required() != null ? action.required() : currentRules.required(),
      action.minSelections() != null ? action.minSelections() : currentRules.minSelections(),
      action.maxSelections() != null ? action.maxSelections() : currentRules.maxSelections(),
      currentRules.visible(),
      currentRules.available(),
      currentRules.priceDeltaOverride(),
      currentRules.freeSelections()
    );
  }
}
