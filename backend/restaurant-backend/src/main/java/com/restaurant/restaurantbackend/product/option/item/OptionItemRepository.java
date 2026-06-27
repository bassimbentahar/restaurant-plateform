package com.restaurant.restaurantbackend.product.option.item;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OptionItemRepository extends JpaRepository<OptionItem, UUID> {
  List<OptionItem> findAllByIdIn(List<UUID> ids);
}
