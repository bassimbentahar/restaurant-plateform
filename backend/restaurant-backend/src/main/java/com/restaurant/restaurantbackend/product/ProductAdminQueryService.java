package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditResponse;
import com.restaurant.restaurantbackend.product.exception.ProductNotFoundException;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.mapper.ProductEditMapper;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRule;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleRepository;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductAdminQueryService {

  private final ProductRepository productRepository;
  private final RestaurantRuleRepository ruleRepository;
  private final ProductEditMapper productEditMapper;

  public ProductEditResponse getProductForEdit(UUID productId) {
    Product product = productRepository.findById(productId)
      .orElseThrow(() -> new ProductNotFoundException(
        "Product not found with ID: " + productId
      ));

    List<RestaurantRule> rules = findRulesForProduct(product);

    return productEditMapper.toEditResponse(product, rules);
  }

  private List<RestaurantRule> findRulesForProduct(Product product) {
    if (
      product.getRestaurant() == null
        || product.getRestaurant().getId() == null
    ) {
      return List.of();
    }

    return ruleRepository.findByRestaurantIdOrderByNameAsc(
        product.getRestaurant().getId()
      )
      .stream()
      .filter(rule -> ruleTargetsProduct(rule, product))
      .toList();
  }

  private boolean ruleTargetsProduct(
    RestaurantRule rule,
    Product product
  ) {
    RuleCondition condition = rule.getCondition();

    if (condition == null) {
      return false;
    }

    if (product.getId().equals(condition.productId())) {
      return true;
    }

    if (
      condition.variantId() != null
        && productVariantIds(product).contains(condition.variantId())
    ) {
      return true;
    }

    if (
      condition.optionGroupId() != null
        && productOptionGroupIds(product).contains(condition.optionGroupId())
    ) {
      return true;
    }

    if (
      condition.optionItemId() != null
        && productOptionItemIds(product).contains(condition.optionItemId())
    ) {
      return true;
    }

    return condition.selectedOptionItemIds() != null
      && condition.selectedOptionItemIds()
      .stream()
      .anyMatch(productOptionItemIds(product)::contains);
  }

  private List<UUID> productVariantIds(Product product) {
    if (product.getVariants() == null || product.getVariants().isEmpty()) {
      return List.of();
    }

    return product.getVariants()
      .stream()
      .map(ProductVariant::getId)
      .toList();
  }

  private List<UUID> productOptionGroupIds(Product product) {
    List<UUID> ids = new java.util.ArrayList<>();

    if (product.getOptionGroups() != null) {
      product.getOptionGroups()
        .stream()
        .filter(link -> link.getOptionGroup() != null)
        .map(link -> link.getOptionGroup().getId())
        .forEach(ids::add);
    }

    if (product.getVariants() != null) {
      product.getVariants()
        .stream()
        .filter(variant -> variant.getOptionGroups() != null)
        .flatMap(variant -> variant.getOptionGroups().stream())
        .filter(link -> link.getOptionGroup() != null)
        .map(link -> link.getOptionGroup().getId())
        .forEach(ids::add);
    }

    return ids.stream()
      .distinct()
      .toList();
  }

  private List<UUID> productOptionItemIds(Product product) {
    List<UUID> ids = new java.util.ArrayList<>();

    if (product.getOptionGroups() != null) {
      product.getOptionGroups()
        .stream()
        .filter(link -> link.getOptionGroup() != null)
        .filter(link -> link.getOptionGroup().getItems() != null)
        .flatMap(link -> link.getOptionGroup().getItems().stream())
        .map(OptionItem::getId)
        .forEach(ids::add);
    }

    if (product.getVariants() != null) {
      product.getVariants()
        .stream()
        .filter(variant -> variant.getOptionGroups() != null)
        .flatMap(variant -> variant.getOptionGroups().stream())
        .filter(link -> link.getOptionGroup() != null)
        .filter(link -> link.getOptionGroup().getItems() != null)
        .flatMap(link -> link.getOptionGroup().getItems().stream())
        .map(OptionItem::getId)
        .forEach(ids::add);
    }

    return ids.stream()
      .distinct()
      .toList();
  }
}
