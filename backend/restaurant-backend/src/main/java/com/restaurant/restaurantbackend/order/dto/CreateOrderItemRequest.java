package com.restaurant.restaurantbackend.order.dto;

import jakarta.validation.constraints.*;

import java.util.List;
import java.util.UUID;

public record CreateOrderItemRequest(
  @NotNull UUID productId,
  UUID variantId,
  @Min(1) int quantity,
  List<UUID> optionItemIds,
  String specialInstructions
) {}
