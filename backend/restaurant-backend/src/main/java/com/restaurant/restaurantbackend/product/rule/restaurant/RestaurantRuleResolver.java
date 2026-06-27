package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryLink;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.option.ProductOptionGroupLink;
import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.product.variant.VariantOptionGroup;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RestaurantRuleResolver {

  private final RestaurantRuleAssignmentRepository assignmentRepository;

  public List<EffectiveRestaurantRule> findActiveRulesForProduct(Product product) {
    UUID restaurantId = product.getRestaurant().getId();
    UUID productId = product.getId();

    List<UUID> variantIds = product.getVariants() == null
      ? List.of()
      : product.getVariants().stream()
      .map(ProductVariant::getId)
      .toList();

    List<UUID> optionGroupIds = collectOptionGroupIds(product);

    List<UUID> categoryIds = product.getCategories() == null
      ? List.of()
      : product.getCategories().stream()
      .map(ProductCategoryLink::getCategory)
      .map(category -> category.getId())
      .toList();

    return assignmentRepository.findActiveAssignmentsForProductCatalog(
        restaurantId,
        productId,
        variantIds,
        optionGroupIds,
        categoryIds,
        LocalDateTime.now()
      )
      .stream()
      .map(this::toEffectiveRule)
      .toList();
  }

  private List<UUID> collectOptionGroupIds(Product product) {
    Stream<UUID> productOptionGroupIds =
      product.getOptionGroups() == null
        ? Stream.empty()
        : product.getOptionGroups().stream()
        .map(ProductOptionGroupLink::getOptionGroup)
        .filter(optionGroup -> optionGroup != null)
        .map(OptionGroup::getId);

    Stream<UUID> variantOptionGroupIds =
      product.getVariants() == null
        ? Stream.empty()
        : product.getVariants().stream()
        .filter(variant -> variant.getOptionGroups() != null)
        .flatMap(variant -> variant.getOptionGroups().stream())
        .map(VariantOptionGroup::getOptionGroup)
        .filter(optionGroup -> optionGroup != null)
        .map(OptionGroup::getId);

    return Stream.concat(productOptionGroupIds, variantOptionGroupIds)
      .distinct()
      .toList();
  }

  private EffectiveRestaurantRule toEffectiveRule(
    RestaurantRuleAssignment assignment
  ) {
    RestaurantRule rule = assignment.getRule();

    RuleCondition condition = mergeCondition(
      rule.getCondition(),
      assignment.getConditionOverride()
    );

    RuleAction action = mergeAction(
      rule.getAction(),
      assignment.getActionOverride()
    );

    return new EffectiveRestaurantRule(
      rule.getId(),
      rule.getName(),
      rule.getDescription(),
      rule.isCustomerVisible(),
      rule.getCustomerTitle(),
      rule.getCustomerDescription(),
      rule.getRuleType(),
      assignment.getTargetType(),
      assignment.getCategory() != null ? assignment.getCategory().getId() : null,
      assignment.getProduct() != null ? assignment.getProduct().getId() : null,
      assignment.getVariant() != null ? assignment.getVariant().getId() : null,
      assignment.getOptionGroup() != null ? assignment.getOptionGroup().getId() : null,
      assignment.getOptionItem() != null ? assignment.getOptionItem().getId() : null,
      assignment.getPriority(),
      condition,
      action
    );
  }

  private RuleCondition mergeCondition(
    RuleCondition base,
    RuleCondition override
  ) {
    return override != null ? override : base;
  }

  private RuleAction mergeAction(
    RuleAction base,
    RuleAction override
  ) {
    return override != null ? override : base;
  }
}
