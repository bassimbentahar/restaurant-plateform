package com.restaurant.restaurantbackend.product.rule.handler;

import com.restaurant.restaurantbackend.product.rule.OptionGroupRule;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class PriceRuleHandler extends AbstractOptionGroupRuleHandler {

  @Override
  public RuleType type() {
    return RuleType.PRICE_RULE;
  }

  @Override
  public EffectiveOptionGroupRules apply(
    OptionGroupRule rule,
    EffectiveOptionGroupRules currentRules
  ) {
    Map<String, Object> actions = rule.getActionJson();

    BigDecimal priceDeltaOverride = getBigDecimal(actions, "priceDeltaOverride");

    return new EffectiveOptionGroupRules(
      currentRules.required(),
      currentRules.minSelections(),
      currentRules.maxSelections(),
      currentRules.visible(),
      currentRules.available(),
      priceDeltaOverride != null ? priceDeltaOverride : currentRules.priceDeltaOverride(),
      currentRules.freeSelections()
    );
  }
}
