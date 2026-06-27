package com.restaurant.restaurantbackend.product.option;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OptionGroupRepository extends JpaRepository<OptionGroup, UUID> {
}
