package com.restaurant.restaurantbackend.restaurant.fulfillment.dto;

import java.util.UUID;

public record RestaurantFulfillmentSettingsResponse(
  UUID id,
  UUID restaurantId,
  boolean deliveryEnabled,
  boolean pickupEnabled,
  int preparationMinutes,
  int deliveryMinutes,
  int slotIntervalMinutes,
  int maxOrdersPerSlot,
  boolean asapEnabled,
  boolean scheduledEnabled,
  int daysAhead
) {}
