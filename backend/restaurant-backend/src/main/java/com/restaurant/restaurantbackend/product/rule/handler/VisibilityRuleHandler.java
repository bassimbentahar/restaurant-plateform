package com.restaurant.restaurantbackend.product.rule.handler;

import com.restaurant.restaurantbackend.product.rule.OptionGroupRule;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class VisibilityRuleHandler extends AbstractOptionGroupRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.VISIBILITY;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    OptionGroupRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    Map<String, Object> actions = rule.getActionJson();

    Boolean visible = getBoolean(actions, "visible");

    return new EffectiveOptionGroupRules(
      currentRules.required(),
      currentRules.minSelections(),
      currentRules.maxSelections(),
      visible != null ? visible : currentRules.visible(),
      currentRules.available(),
      currentRules.priceDeltaOverride(),
      currentRules.freeSelections()
    );
  }
}
