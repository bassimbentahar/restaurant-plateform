package com.restaurant.restaurantbackend.restaurant.delivery.slot.dto;

import java.util.List;

public record DeliverySlotDayResponse(
  String date,
  String label,
  boolean disabled,
  List<DeliverySlotResponse> slots
) {}
