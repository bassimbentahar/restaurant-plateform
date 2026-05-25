package com.restaurant.restaurantbackend.order.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderItemResponse(
  UUID id,
  UUID productId,
  String productName,
  UUID variantId,
  String variantName,
  int quantity,
  BigDecimal baseUnitPrice,
  BigDecimal unitFinalPrice,
  BigDecimal lineTotalPrice,
  String specialInstructions,
  List<OrderItemOptionResponse> options
) {}
