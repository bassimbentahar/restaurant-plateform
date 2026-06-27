package com.restaurant.restaurantbackend.product.option;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.dto.ResolvedOptionGroup;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import com.restaurant.restaurantbackend.product.rule.RuleContext;
import com.restaurant.restaurantbackend.product.rule.RuleContextFactory;
import com.restaurant.restaurantbackend.product.rule.dto.EffectiveOptionGroupRules;
import com.restaurant.restaurantbackend.product.rule.restaurant.EffectiveRestaurantRule;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleEngine;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleResolver;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.product.variant.VariantOptionGroup;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OptionGroupResolutionService {

  private final RuleContextFactory ruleContextFactory;
  private final RestaurantRuleResolver restaurantRuleResolver;
  private final RestaurantRuleEngine ruleEngine;

  public ProductOptionResolutionContext prepareProductContext(Product product) {
    Map<UUID, ProductOptionGroupLink> productLinksByOptionGroupId =
      product.getOptionGroups() == null
        ? Map.of()
        : product.getOptionGroups().stream()
        .filter(link -> link.getOptionGroup() != null)
        .collect(Collectors.toMap(
          link -> link.getOptionGroup().getId(),
          Function.identity()
        ));

    List<EffectiveRestaurantRule> activeRules =
      restaurantRuleResolver.findActiveRulesForProduct(product);

    return new ProductOptionResolutionContext(
      product,
      productLinksByOptionGroupId,
      activeRules
    );
  }

  public List<ResolvedOptionGroup> resolveAllForVariant(
    ProductOptionResolutionContext context,
    ProductVariant variant
  ) {
    Product product = context.product();

    Map<UUID, ProductOptionGroupLink> productLinks =
      context.productLinksByOptionGroupId();

    List<VariantOptionGroup> variantLinks = variant.getOptionGroups() == null
      ? List.of()
      : variant.getOptionGroups();

    Map<UUID, VariantOptionGroup> variantLinksByOptionGroupId =
      variantLinks.stream()
        .filter(link -> link.getOptionGroup() != null)
        .collect(Collectors.toMap(
          link -> link.getOptionGroup().getId(),
          Function.identity()
        ));

    List<ResolvedOptionGroup> resolvedOptionGroups = new ArrayList<>();

    for (ProductOptionGroupLink productLink : productLinks.values()) {
      UUID optionGroupId = productLink.getOptionGroup().getId();

      VariantOptionGroup variantLink =
        variantLinksByOptionGroupId.get(optionGroupId);

      RuleContext ruleContext = ruleContextFactory.build(
        product,
        variant,
        optionGroupId
      );

      resolvedOptionGroups.add(resolveSingle(
        productLink.getOptionGroup(),
        productLink,
        variantLink,
        ruleContext,
        context.activeRules(),
        variantLink != null
          ? variantLink.getDisplayOrder()
          : productLink.getDisplayOrder()
      ));
    }

    for (VariantOptionGroup variantLink : variantLinks) {
      if (variantLink.getOptionGroup() == null) {
        continue;
      }

      UUID optionGroupId = variantLink.getOptionGroup().getId();

      if (productLinks.containsKey(optionGroupId)) {
        continue;
      }

      RuleContext ruleContext = ruleContextFactory.build(
        product,
        variant,
        optionGroupId
      );

      resolvedOptionGroups.add(resolveSingle(
        variantLink.getOptionGroup(),
        null,
        variantLink,
        ruleContext,
        context.activeRules(),
        variantLink.getDisplayOrder()
      ));
    }

    return resolvedOptionGroups.stream()
      .sorted(Comparator.comparing(
        ResolvedOptionGroup::displayOrder,
        Comparator.nullsLast(Integer::compareTo)
      ))
      .toList();
  }

  private ResolvedOptionGroup resolveSingle(
    OptionGroup group,
    ProductOptionGroupLink productLink,
    VariantOptionGroup variantLink,
    RuleContext ruleContext,
    List<EffectiveRestaurantRule> activeRules,
    Integer displayOrder
  ) {
    EffectiveOptionGroupRules baseRules =
      resolveBaseRules(group, productLink, variantLink);

    EffectiveOptionGroupRules finalRules =
      applyDynamicRules(group, ruleContext, activeRules, baseRules);

    List<OptionItem> visibleItems =
      resolveVisibleItems(group, productLink);

    validateResolvedRulesAgainstVisibleItems(
      group,
      finalRules,
      visibleItems
    );

    return new ResolvedOptionGroup(
      group,
      visibleItems,
      finalRules,
      displayOrder
    );
  }

  private EffectiveOptionGroupRules resolveBaseRules(
    OptionGroup group,
    ProductOptionGroupLink productLink,
    VariantOptionGroup variantLink
  ) {
    return new EffectiveOptionGroupRules(
      resolveRequired(group, productLink, variantLink),
      resolveMinSelections(group, productLink, variantLink),
      resolveMaxSelections(group, productLink, variantLink),
      true,
      true,
      null,
      0
    );
  }

  private EffectiveOptionGroupRules applyDynamicRules(
    OptionGroup group,
    RuleContext context,
    List<EffectiveRestaurantRule> activeRules,
    EffectiveOptionGroupRules baseRules
  ) {
    List<EffectiveRestaurantRule> applicableRules =
      activeRules == null
        ? List.of()
        : activeRules.stream()
        .filter(rule -> appliesToOptionGroup(rule, context, group.getId()))
        .sorted(Comparator.comparing(EffectiveRestaurantRule::priority))
        .toList();

    return ruleEngine.applyRules(applicableRules, context, baseRules);
  }

  private boolean appliesToOptionGroup(
    EffectiveRestaurantRule rule,
    RuleContext context,
    UUID optionGroupId
  ) {
    return switch (rule.targetType()) {
      case RESTAURANT -> true;

      case CATEGORY -> true;

      case PRODUCT ->
        rule.productId() != null
          && rule.productId().equals(context.productId());

      case VARIANT ->
        rule.variantId() != null
          && rule.variantId().equals(context.variantId());

      case OPTION_GROUP ->
        rule.optionGroupId() != null
          && rule.optionGroupId().equals(optionGroupId);

      case OPTION_ITEM -> true;
    };
  }

  private boolean resolveRequired(
    OptionGroup group,
    ProductOptionGroupLink productLink,
    VariantOptionGroup variantLink
  ) {
    if (variantLink != null && variantLink.getRequiredOverride() != null) {
      return variantLink.getRequiredOverride();
    }

    if (productLink != null && productLink.getRequiredOverride() != null) {
      return productLink.getRequiredOverride();
    }

    return group.isRequired();
  }

  private Integer resolveMinSelections(
    OptionGroup group,
    ProductOptionGroupLink productLink,
    VariantOptionGroup variantLink
  ) {
    if (variantLink != null && variantLink.getMinSelectOverride() != null) {
      return variantLink.getMinSelectOverride();
    }

    if (productLink != null && productLink.getMinSelectOverride() != null) {
      return productLink.getMinSelectOverride();
    }

    return group.getMinSelections();
  }

  private Integer resolveMaxSelections(
    OptionGroup group,
    ProductOptionGroupLink productLink,
    VariantOptionGroup variantLink
  ) {
    if (variantLink != null && variantLink.getMaxSelectOverride() != null) {
      return variantLink.getMaxSelectOverride();
    }

    if (productLink != null && productLink.getMaxSelectOverride() != null) {
      return productLink.getMaxSelectOverride();
    }

    return group.getMaxSelections();
  }

  private List<OptionItem> resolveVisibleItems(
    OptionGroup group,
    ProductOptionGroupLink productLink
  ) {
    if (group.getItems() == null) {
      return List.of();
    }

    return group.getItems()
      .stream()
      .filter(item -> {
        if (productLink != null) {
          return productLink.isItemVisibleForProduct(item);
        }

        return item.isAvailable();
      })
      .toList();
  }

  private void validateResolvedRulesAgainstVisibleItems(
    OptionGroup group,
    EffectiveOptionGroupRules rules,
    List<OptionItem> visibleItems
  ) {
    int visibleItemCount = visibleItems.size();

    if (rules.minSelections() > rules.maxSelections()) {
      throw new IllegalStateException(
        "Invalid option group rules for " + group.getName()
          + ": minSelections cannot be greater than maxSelections"
      );
    }

    if (rules.maxSelections() > visibleItemCount) {
      throw new IllegalStateException(
        "Invalid option group rules for " + group.getName()
          + ": maxSelections cannot exceed visible option items count"
      );
    }

    if (rules.required() && rules.minSelections() < 1) {
      throw new IllegalStateException(
        "Invalid option group rules for " + group.getName()
          + ": required group must have minSelections >= 1"
      );
    }

    if (rules.required() && rules.maxSelections() < 1) {
      throw new IllegalStateException(
        "Invalid option group rules for " + group.getName()
          + ": required group must have maxSelections >= 1"
      );
    }
  }
}
