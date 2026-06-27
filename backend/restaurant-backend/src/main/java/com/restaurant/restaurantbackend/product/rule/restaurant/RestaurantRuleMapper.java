package com.restaurant.restaurantbackend.product.rule.restaurant;


import com.restaurant.restaurantbackend.product.rule.RuleTag;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleResponse;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RuleTagResponse;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class RestaurantRuleMapper {

  public RestaurantRuleResponse toResponse(RestaurantRule rule) {
    return new RestaurantRuleResponse(
      rule.getId(),
      rule.getName(),
      rule.getDescription(),
      rule.getRuleType(),
      rule.isActive(),
      rule.isFavorite(),
      rule.isReusable(),
      rule.isCustomerVisible(),
      rule.getCustomerTitle(),
      rule.getCustomerDescription(),
      rule.getCondition(),
      rule.getAction(),
      toTagResponses(rule)
    );
  }

  private List<RuleTagResponse> toTagResponses(RestaurantRule rule) {

    return rule.getTags()
      .stream()
      .sorted(Comparator.comparing(RuleTag::getName))
      .map(tag -> new RuleTagResponse(
        tag.getId(),
        tag.getName(),
        tag.getColor()
      ))
      .toList();
  }
}
