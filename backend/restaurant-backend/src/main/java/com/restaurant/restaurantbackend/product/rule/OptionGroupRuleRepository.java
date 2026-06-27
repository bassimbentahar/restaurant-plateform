package com.restaurant.restaurantbackend.product.rule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OptionGroupRuleRepository extends JpaRepository<OptionGroupRule, UUID> {

  List<OptionGroupRule> findByProductIdAndIsActiveTrueOrderByPriorityAsc(UUID productId);

  List<OptionGroupRule> findByVariantIdAndIsActiveTrueOrderByPriorityAsc(UUID variantId);

  List<OptionGroupRule> findByOptionGroupIdAndIsActiveTrueOrderByPriorityAsc(UUID optionGroupId);
}
