package com.restaurant.restaurantbackend.restaurant.fulfillment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantFulfillmentSettingsRepository
  extends JpaRepository<com.restaurant.restaurantbackend.restaurant.fulfillment.RestaurantFulfillmentSettings, UUID> {

  Optional<com.restaurant.restaurantbackend.restaurant.fulfillment.RestaurantFulfillmentSettings> findByRestaurantId(UUID restaurantId);
}
