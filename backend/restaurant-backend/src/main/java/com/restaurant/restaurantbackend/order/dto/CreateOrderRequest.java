package com.restaurant.restaurantbackend.order.dto;

import com.restaurant.restaurantbackend.order.DeliveryTimeType;
import com.restaurant.restaurantbackend.order.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
  @NotNull UUID restaurantId,
  UUID addressId,

  @NotNull OrderType orderType,
  @NotNull DeliveryTimeType deliveryTimeType,

  LocalDate scheduledDate,
  LocalTime scheduledTime,

  @NotBlank String customerFirstname,
  @NotBlank String customerLastname,
  @NotBlank String customerPhone,

  String note,

  @NotEmpty List<@Valid CreateOrderItemRequest> items
) {}
