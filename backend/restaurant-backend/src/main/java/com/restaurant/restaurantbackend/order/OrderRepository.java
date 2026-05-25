package com.restaurant.restaurantbackend.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

  boolean existsByOrderNumber(String orderNumber);

  List<Order> findByUserIdOrderByCreatedDateDesc(UUID userId);

  List<Order> findByRestaurantIdOrderByCreatedDateDesc(UUID restaurantId);
}
