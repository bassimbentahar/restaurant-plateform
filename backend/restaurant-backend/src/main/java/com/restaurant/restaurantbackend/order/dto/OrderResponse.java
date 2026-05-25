package com.restaurant.restaurantbackend.order.dto;

import com.restaurant.restaurantbackend.order.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
  UUID id,
  String orderNumber,
  UUID restaurantId,
  UUID userId,
  UUID addressId,
  OrderType orderType,
  OrderStatus status,
  DeliveryTimeType deliveryTimeType,
  LocalDate scheduledDate,
  LocalTime scheduledTime,
  BigDecimal subtotal,
  BigDecimal serviceFee,
  BigDecimal deliveryFee,
  BigDecimal total,
  String customerFirstname,
  String customerLastname,
  String customerPhone,
  String note,
  LocalDateTime createdAt,
  LocalDateTime updatedAt,
  List<OrderItemResponse> items
) {}
