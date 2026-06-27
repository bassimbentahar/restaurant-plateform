package com.restaurant.restaurantbackend.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

  Optional<Product> findByIdAndRestaurantId(UUID id, UUID restaurantId);

  @Query("""
    select count(product) > 0
    from Product product
    where product.restaurant.id = :restaurantId
      and product.slug = :slug
  """)
  boolean existsByRestaurantIdAndSlug(
    @Param("restaurantId") UUID restaurantId,
    @Param("slug") String slug
  );

}
