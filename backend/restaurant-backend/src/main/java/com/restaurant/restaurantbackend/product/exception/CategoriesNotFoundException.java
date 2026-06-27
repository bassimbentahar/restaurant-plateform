package com.restaurant.restaurantbackend.product.exception;

import java.util.List;
import java.util.UUID;

public class CategoriesNotFoundException extends RuntimeException {

  public CategoriesNotFoundException(List<UUID> ids) {
    super("Categories not found: " + ids);
  }
}
