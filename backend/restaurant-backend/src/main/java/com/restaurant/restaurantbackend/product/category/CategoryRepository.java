package com.restaurant.restaurantbackend.product.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<ProductCategory, UUID> {

  List<ProductCategory> findByRestaurantIdOrderByNameAsc(UUID restaurantId);

  List<ProductCategory> findByRestaurantIdAndIdIn(
    UUID restaurantId,
    List<UUID> categoryIds
  );

  boolean existsByRestaurantIdAndSlug(UUID restaurantId, String slug);

  boolean existsByRestaurantIdAndNameIgnoreCase(UUID restaurantId, String name);
}
