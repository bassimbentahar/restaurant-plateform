package com.restaurant.restaurantbackend.product.rule.handler;

import com.restaurant.restaurantbackend.product.rule.OptionGroupRule;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class IncludedOptionRuleHandler extends AbstractOptionGroupRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.INCLUDED_OPTION;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    OptionGroupRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    Map<String, Object> actions = rule.getActionJson();

    Integer freeSelections = getInteger(actions, "freeSelections");

    return new EffectiveOptionGroupRules(
      currentRules.required(),
      currentRules.minSelections(),
      currentRules.maxSelections(),
      currentRules.visible(),
      currentRules.available(),
      currentRules.priceDeltaOverride(),
      freeSelections != null ? freeSelections : currentRules.freeSelections()
    );
  }
}
