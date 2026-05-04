package com.restaurant.restaurantbackend.restaurant.dto;

public record RestaurantStatusRequest(
  Boolean active,
  Boolean open,
  Boolean supportsDelivery,
  Boolean supportsPickup
) {}
