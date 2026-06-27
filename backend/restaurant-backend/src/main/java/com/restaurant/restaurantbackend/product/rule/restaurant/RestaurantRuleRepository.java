package com.restaurant.restaurantbackend.product.rule.restaurant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

import com.restaurant.restaurantbackend.product.util.RuleType;


public interface RestaurantRuleRepository extends JpaRepository<RestaurantRule, UUID> {

  List<RestaurantRule> findByRestaurantIdOrderByNameAsc(UUID restaurantId);

  List<RestaurantRule> findByRestaurantIdAndActiveTrueOrderByNameAsc(UUID restaurantId);

  List<RestaurantRule> findByRestaurantIdAndFavoriteTrueOrderByNameAsc(UUID restaurantId);

  List<RestaurantRule> findByRestaurantIdAndReusableTrueOrderByNameAsc(UUID restaurantId);

  List<RestaurantRule> findByRestaurantIdAndRuleTypeOrderByNameAsc(
    UUID restaurantId,
    RuleType ruleType
  );
}
