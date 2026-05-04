package com.restaurant.restaurantbackend.restaurant.delivery.slot.dto;

public record DeliverySlotResponse(
  String time,
  String label,
  boolean disabled,
  String reason
) {}
