package com.restaurant.restaurantbackend.restaurant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RestaurantOpeningHourRepository
  extends JpaRepository<RestaurantOpeningHour, UUID> {

  List<RestaurantOpeningHour> findByRestaurantId(UUID restaurantId);
}
