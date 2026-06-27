package com.restaurant.restaurantbackend.product.rule.handler;

import com.restaurant.restaurantbackend.product.rule.OptionGroupRule;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AvailabilityRuleHandler extends AbstractOptionGroupRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.AVAILABILITY;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    OptionGroupRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    Map<String, Object> actions = rule.getActionJson();

    Boolean available = getBoolean(actions, "available");

    return new EffectiveOptionGroupRules(
      currentRules.required(),
      currentRules.minSelections(),
      currentRules.maxSelections(),
      currentRules.visible(),
      available != null ? available : currentRules.available(),
      currentRules.priceDeltaOverride(),
      currentRules.freeSelections()
    );
  }
}
