package com.restaurant.restaurantbackend.product.dto;

import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;

import java.util.List;

public record ResolvedOptionGroup(
  OptionGroup optionGroup,
  List<OptionItem> items,
  EffectiveOptionGroupRules rules,
  Integer displayOrder
) {}
