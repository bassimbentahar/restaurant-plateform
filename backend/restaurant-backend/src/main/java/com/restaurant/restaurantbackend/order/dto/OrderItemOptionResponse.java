package com.restaurant.restaurantbackend.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemOptionResponse(
  UUID id,
  UUID optionGroupId,
  String optionGroupName,
  UUID optionItemId,
  String optionName,
  BigDecimal priceDelta
) {}
