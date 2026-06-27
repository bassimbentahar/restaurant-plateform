package com.restaurant.restaurantbackend.product.rule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RuleTagRepository extends JpaRepository<RuleTag, UUID> {

  List<RuleTag> findByRestaurantIdOrderByNameAsc(UUID restaurantId);

  Optional<RuleTag> findByRestaurantIdAndNameIgnoreCase(
    UUID restaurantId,
    String name
  );
}
