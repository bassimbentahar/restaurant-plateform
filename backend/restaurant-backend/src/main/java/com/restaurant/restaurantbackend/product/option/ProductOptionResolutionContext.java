package com.restaurant.restaurantbackend.product.option;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.rule.restaurant.EffectiveRestaurantRule;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Voici toutes les informations communes du produit dont j’ai besoin pour résoudre les variantes.
 * @param product
 * @param productLinksByOptionGroupId
 */
public record ProductOptionResolutionContext(
  Product product,
  Map<UUID, ProductOptionGroupLink> productLinksByOptionGroupId,
  List<EffectiveRestaurantRule> activeRules
) {}
