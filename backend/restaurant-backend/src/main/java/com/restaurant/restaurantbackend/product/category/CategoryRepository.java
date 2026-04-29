package com.restaurant.restaurantbackend.product.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoryRepository extends JpaRepository<ProductCategory, UUID> {
}
