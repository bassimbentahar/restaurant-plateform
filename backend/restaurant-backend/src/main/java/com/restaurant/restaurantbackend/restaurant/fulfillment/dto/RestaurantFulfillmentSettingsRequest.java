package com.restaurant.restaurantbackend.restaurant.fulfillment.dto;

public record RestaurantFulfillmentSettingsRequest(
  Boolean deliveryEnabled,
  Boolean pickupEnabled,
  Integer preparationMinutes,
  Integer deliveryMinutes,
  Integer slotIntervalMinutes,
  Integer maxOrdersPerSlot,
  Boolean asapEnabled,
  Boolean scheduledEnabled,
  Integer daysAhead
) {}
