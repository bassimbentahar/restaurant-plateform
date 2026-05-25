package com.restaurant.restaurantbackend.order.dto;

import com.restaurant.restaurantbackend.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
  @NotNull OrderStatus status
) {}
