package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.rule.RuleContext;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RestaurantRuleEngine {

  private final Map<RuleType, RestaurantRuleHandler> handlersByType;

  public RestaurantRuleEngine(List<RestaurantRuleHandler> handlers) {
    this.handlersByType = handlers.stream()
      .collect(Collectors.toMap(
        RestaurantRuleHandler::type,
        Function.identity(),
        (existing, replacement) -> existing,
        () -> new EnumMap<>(RuleType.class)
      ));
  }

  public EffectiveOptionGroupRules applyRules(
    List<EffectiveRestaurantRule> rules,
    RuleContext context,
    EffectiveOptionGroupRules baseRules
  ) {
    EffectiveOptionGroupRules currentRules = baseRules;

    if (rules == null || rules.isEmpty()) {
      return currentRules;
    }

    for (EffectiveRestaurantRule rule : rules) {
      RestaurantRuleHandler handler = handlersByType.get(rule.ruleType());

      if (handler == null) {
        continue;
      }

      if (handler.matches(rule, context)) {
        currentRules = handler.apply(rule, currentRules);
      }
    }

    return currentRules;
  }
}
