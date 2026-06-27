package com.restaurant.restaurantbackend.product.rule.handler;

import com.restaurant.restaurantbackend.product.rule.OptionGroupRule;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SelectionRuleHandler extends AbstractOptionGroupRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.SELECTION_RULE;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    OptionGroupRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    Map<String, Object> actions = rule.getActionJson();

    Boolean required = getBoolean(actions, "required");
    Integer minSelections = getInteger(actions, "minSelections");
    Integer maxSelections = getInteger(actions, "maxSelections");

    return new EffectiveOptionGroupRules(
      required != null ? required : currentRules.required(),
      minSelections != null ? minSelections : currentRules.minSelections(),
      maxSelections != null ? maxSelections : currentRules.maxSelections(),
      currentRules.visible(),
      currentRules.available(),
      currentRules.priceDeltaOverride(),
      currentRules.freeSelections()
    );
  }
}
