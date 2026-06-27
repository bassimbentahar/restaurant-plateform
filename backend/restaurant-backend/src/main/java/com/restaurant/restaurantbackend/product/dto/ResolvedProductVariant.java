package com.restaurant.restaurantbackend.product.dto;

import com.restaurant.restaurantbackend.product.variant.ProductVariant;

import java.util.List;

public record ResolvedProductVariant(
  ProductVariant variant,
  List<ResolvedOptionGroup> optionGroups
) {}
