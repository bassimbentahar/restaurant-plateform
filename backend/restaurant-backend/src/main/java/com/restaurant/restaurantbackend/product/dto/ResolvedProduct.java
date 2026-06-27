package com.restaurant.restaurantbackend.product.dto;

import com.restaurant.restaurantbackend.product.Product;

import java.util.List;

public record ResolvedProduct(
  Product product,
  List<ResolvedProductVariant> variants
) {}
