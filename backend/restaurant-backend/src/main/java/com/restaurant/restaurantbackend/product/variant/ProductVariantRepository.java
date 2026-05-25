package com.restaurant.restaurantbackend.product.variant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
  Optional<ProductVariant> findByIdAndProductId(UUID id, UUID productId);
}
