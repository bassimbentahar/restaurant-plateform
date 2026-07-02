package com.restaurant.restaurantbackend.product.mapper;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.category.CategoryMapper;
import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;
import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryLink;
import com.restaurant.restaurantbackend.product.image.dto.ProductImageResponse;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditOptionGroupResponse;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditOptionItemOverrideResponse;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditOptionItemResponse;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditResponse;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditRuleResponse;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditVariantOptionGroupResponse;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditVariantResponse;
import com.restaurant.restaurantbackend.product.image.ProductImage;
import com.restaurant.restaurantbackend.product.option.ProductOptionGroupLink;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.rule.RuleTag;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRule;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleAssignment;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.product.variant.VariantOptionGroup;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class ProductEditMapper {

  private final CategoryMapper categoryMapper;
  private final ProductImageMapper productImageMapper;

  public ProductEditMapper(
    CategoryMapper categoryMapper,
    ProductImageMapper productImageMapper
  ) {
    this.categoryMapper = categoryMapper;
    this.productImageMapper = productImageMapper;
  }

  public ProductEditResponse toEditResponse(
    Product product,
    List<RestaurantRuleAssignment> ruleAssignments
  ) {
    return new ProductEditResponse(
      product.getId(),
      product.getSku(),
      product.getSlug(),
      product.getTitle(),
      product.getShortDescription(),
      product.getDescription(),
      product.getThumb(),
      product.getStatus(),

      product.getBasePrice(),
      product.isAvailable(),
      product.isFeatured(),
      product.isArchived(),

      product.getPreparationTimeMinutes(),
      product.getAvailableFrom(),
      product.getAvailableTo(),

      product.getCalories(),
      product.getIngredientsText(),
      product.getAllergensText(),

      mapCategories(product),
      mapImages(product),

      mapProductOptionGroups(product),
      mapVariants(product),
      mapRules(ruleAssignments),

      product.getCreatedDate(),
      product.getLastModifiedDate()
    );
  }

  private List<ProductCategoryResponse> mapCategories(Product product) {
    if (product.getCategories() == null || product.getCategories().isEmpty()) {
      return List.of();
    }

    return categoryMapper.toProductCategoriesResponse(
      product.getCategories()
        .stream()
        .sorted(Comparator.comparingInt(this::categoryDisplayOrder))
        .map(ProductCategoryLink::getCategory)
        .toList()
    );
  }

  private int categoryDisplayOrder(ProductCategoryLink link) {
    return link.getDisplayOrder() == null ? 0 : link.getDisplayOrder();
  }

  private List<ProductImageResponse> mapImages(Product product) {
    if (product.getImages() == null || product.getImages().isEmpty()) {
      return List.of();
    }

    return product.getImages()
      .stream()
      .sorted(Comparator.comparingInt(this::imageDisplayOrder))
      .map(productImageMapper::toResponse)
      .toList();
  }

  private int imageDisplayOrder(ProductImage image) {
    return image.getDisplayOrder() == null ? 0 : image.getDisplayOrder();
  }

  private List<ProductEditOptionGroupResponse> mapProductOptionGroups(
    Product product
  ) {
    if (product.getOptionGroups() == null || product.getOptionGroups().isEmpty()) {
      return List.of();
    }

    return product.getOptionGroups()
      .stream()
      .filter(link -> link.getOptionGroup() != null)
      .sorted(Comparator.comparingInt(this::productOptionGroupDisplayOrder))
      .map(this::mapProductOptionGroup)
      .toList();
  }

  private int productOptionGroupDisplayOrder(ProductOptionGroupLink link) {
    return link.getDisplayOrder() == null ? 0 : link.getDisplayOrder();
  }

  private ProductEditOptionGroupResponse mapProductOptionGroup(
    ProductOptionGroupLink link
  ) {
    var group = link.getOptionGroup();

    return new ProductEditOptionGroupResponse(
      link.getId(),
      group.getId().toString(),

      group.getId(),
      group.getName(),
      group.getDescription(),

      link.getRequiredOverride(),
      link.getMinSelectOverride(),
      link.getMaxSelectOverride(),
      link.getDisplayOrder(),

      mapOptionItems(link),
      mapOptionItemOverrides(link)
    );
  }

  private List<ProductEditOptionItemResponse> mapOptionItems(
    ProductOptionGroupLink link
  ) {
    var group = link.getOptionGroup();

    if (group.getItems() == null || group.getItems().isEmpty()) {
      return List.of();
    }

    return group.getItems()
      .stream()
      .sorted(Comparator.comparingInt(this::optionItemDisplayOrder))
      .map(item -> new ProductEditOptionItemResponse(
        item.getId(),
        item.getId(),
        item.getName(),
        item.getDescription(),
        item.getPriceAdjustment(),
        item.isAvailable(),
        item.getDisplayOrder()
      ))
      .toList();
  }

  private int optionItemDisplayOrder(OptionItem item) {
    return item.getDisplayOrder() == null ? 0 : item.getDisplayOrder();
  }

  private List<ProductEditOptionItemOverrideResponse> mapOptionItemOverrides(
    ProductOptionGroupLink link
  ) {
    var group = link.getOptionGroup();

    if (group.getItems() == null || group.getItems().isEmpty()) {
      return List.of();
    }

    return group.getItems()
      .stream()
      .map(item -> new ProductEditOptionItemOverrideResponse(
        item.getId(),
        link.isItemVisibleForProduct(item)
      ))
      .toList();
  }

  private List<ProductEditVariantResponse> mapVariants(Product product) {
    if (product.getVariants() == null || product.getVariants().isEmpty()) {
      return List.of();
    }

    return product.getVariants()
      .stream()
      .sorted(Comparator.comparingInt(this::variantDisplayOrder))
      .map(this::mapVariant)
      .toList();
  }

  private int variantDisplayOrder(ProductVariant variant) {
    return variant.getDisplayOrder() == null ? 0 : variant.getDisplayOrder();
  }

  private ProductEditVariantResponse mapVariant(ProductVariant variant) {
    return new ProductEditVariantResponse(
      variant.getId(),
      variant.getId().toString(),
      variant.getName(),
      variant.getSku(),
      variant.getPriceAdjustment(),
      variant.getCompareAtPrice(),
      variant.isDefault(),
      variant.isAvailable(),
      variant.getDisplayOrder(),
      mapVariantOptionGroups(variant)
    );
  }

  private List<ProductEditVariantOptionGroupResponse> mapVariantOptionGroups(
    ProductVariant variant
  ) {
    if (variant.getOptionGroups() == null || variant.getOptionGroups().isEmpty()) {
      return List.of();
    }

    return variant.getOptionGroups()
      .stream()
      .filter(link -> link.getOptionGroup() != null)
      .sorted(Comparator.comparingInt(this::variantOptionGroupDisplayOrder))
      .map(this::mapVariantOptionGroup)
      .toList();
  }

  private int variantOptionGroupDisplayOrder(VariantOptionGroup link) {
    return link.getDisplayOrder() == null ? 0 : link.getDisplayOrder();
  }

  private ProductEditVariantOptionGroupResponse mapVariantOptionGroup(
    VariantOptionGroup link
  ) {
    return new ProductEditVariantOptionGroupResponse(
      link.getId(),
      link.getOptionGroup().getId(),
      link.getOptionGroup().getId().toString(),

      link.getRequiredOverride(),
      link.getMinSelectOverride(),
      link.getMaxSelectOverride(),
      link.getIncludedSelectionsOverride(),
      link.getDisplayOrder()
    );
  }

  private List<ProductEditRuleResponse> mapRules(
    List<RestaurantRuleAssignment> assignments
  ) {
    if (assignments == null || assignments.isEmpty()) {
      return List.of();
    }

    return assignments.stream()
      .filter(assignment -> assignment.getRule() != null)
      .map(this::mapRuleAssignment)
      .toList();
  }

  private ProductEditRuleResponse mapRuleAssignment(
    RestaurantRuleAssignment assignment
  ) {
    var rule = assignment.getRule();
    var condition = rule.getCondition();

    return new ProductEditRuleResponse(
      assignment.getId(),
      rule.getId(),

      rule.getName(),
      rule.getDescription(),

      assignment.isActive(),
      rule.isFavorite(),
      rule.isReusable(),

      rule.isCustomerVisible(),
      rule.getCustomerTitle(),
      rule.getCustomerDescription(),

      mapRuleTags(rule),

      rule.getRuleType(),
      assignment.getTargetType() == null
        ? null
        : assignment.getTargetType().name(),

      assignment.getVariant() == null
        ? null
        : assignment.getVariant().getId().toString(),

      assignment.getOptionGroup() == null
        ? null
        : assignment.getOptionGroup().getId().toString(),

      condition == null
        ? null
        : condition.optionItemId(),

      condition,
      rule.getAction(),

      assignment.getPriority()
    );
  }

  private ProductEditRuleResponse mapRule(RestaurantRule rule) {
    RuleCondition condition = rule.getCondition();

    return new ProductEditRuleResponse(
      rule.getId(),
      null,

      rule.getName(),
      rule.getDescription(),

      rule.isActive(),
      rule.isFavorite(),
      rule.isReusable(),

      rule.isCustomerVisible(),
      rule.getCustomerTitle(),
      rule.getCustomerDescription(),

      mapRuleTags(rule),

      rule.getRuleType(),
      resolveTargetType(condition),

      condition == null || condition.variantId() == null
        ? null
        : condition.variantId().toString(),

      condition == null || condition.optionGroupId() == null
        ? null
        : condition.optionGroupId().toString(),

      condition == null
        ? null
        : condition.optionItemId(),

      condition,
      rule.getAction(),

      0
    );
  }

  private String resolveTargetType(RuleCondition condition) {
    if (condition == null) {
      return "RESTAURANT";
    }

    if (condition.optionItemId() != null) {
      return "OPTION_ITEM";
    }

    if (condition.optionGroupId() != null) {
      return "OPTION_GROUP";
    }

    if (condition.variantId() != null) {
      return "VARIANT";
    }

    if (condition.productId() != null) {
      return "PRODUCT";
    }

    return "RESTAURANT";
  }

  private List<String> mapRuleTags(RestaurantRule rule) {
    if (rule.getTags() == null || rule.getTags().isEmpty()) {
      return List.of();
    }

    return rule.getTags()
      .stream()
      .map(RuleTag::getName)
      .sorted(String::compareToIgnoreCase)
      .toList();
  }
}
