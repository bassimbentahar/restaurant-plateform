package com.restaurant.restaurantbackend.product.rule;

import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.rule.handler.OptionGroupRuleHandler;
import com.restaurant.restaurantbackend.product.util.RuleType;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OptionGroupRuleEngine {

  private final Map<RuleType, OptionGroupRuleHandler> handlersByType;

  public OptionGroupRuleEngine(List<OptionGroupRuleHandler> handlers) {
    this.handlersByType = handlers.stream()
      .collect(Collectors.toMap(
        OptionGroupRuleHandler::type,
        Function.identity(),
        (existing, replacement) -> existing,
        () -> new EnumMap<>(RuleType.class)
      ));
  }

  public EffectiveOptionGroupRules applyRules(
    List<OptionGroupRule> rules,
    RuleContext context,
    EffectiveOptionGroupRules baseRules
  ) {
    EffectiveOptionGroupRules currentRules = baseRules;

    if (rules == null || rules.isEmpty()) {
      return currentRules;
    }

    for (OptionGroupRule rule : rules) {
      OptionGroupRuleHandler handler = handlersByType.get(rule.getType());

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
