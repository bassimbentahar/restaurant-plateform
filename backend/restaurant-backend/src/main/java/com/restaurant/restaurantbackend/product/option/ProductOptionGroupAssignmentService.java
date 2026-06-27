package com.restaurant.restaurantbackend.product.option;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.dto.request.ProductOptionGroupAssignmentRequest;
import com.restaurant.restaurantbackend.product.exception.OptionGroupsNotFoundException;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import com.restaurant.restaurantbackend.product.option.item.ProductOptionItemOverride;
import com.restaurant.restaurantbackend.product.option.item.dto.ProductOptionItemOverrideRequest;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.product.variant.VariantOptionGroup;
import com.restaurant.restaurantbackend.product.variant.dto.ProductVariantRequest;
import com.restaurant.restaurantbackend.product.variant.dto.VariantOptionGroupAssignmentRequest;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service responsible for attaching option groups to a product aggregate.
 *
 * <p>This service belongs to the product write side. It is called during
 * product creation, before the product aggregate is persisted.
 *
 * <p>Main responsibilities:
 * <ul>
 *   <li>Attach product-level option groups to the product.</li>
 *   <li>Attach variant-level option groups to product variants.</li>
 *   <li>Create custom product-level option groups when needed.</li>
 *   <li>Resolve existing library option groups by id.</li>
 *   <li>Validate option group ownership by restaurant.</li>
 *   <li>Validate selection constraints.</li>
 *   <li>Collect frontend temporary optionGroup clientIds for rule creation.</li>
 * </ul>
 *
 * <p>Important distinction:
 * <ul>
 *   <li>Product-level option groups may be existing library groups or newly created custom groups.</li>
 *   <li>Variant-level option groups currently reference existing option groups only.</li>
 * </ul>
 *
 * <p>The returned {@link ProductOptionAssignmentResult} is not a public API
 * response. It is a technical creation-time lookup used later by
 * RestaurantRuleApplicationService to resolve rule targets.
 *
 * <pre>
 * optionGroupClientId -> OptionGroup
 * </pre>
 *
 * <p>The same registry collects:
 * <ul>
 *   <li>Option groups attached directly to the product.</li>
 *   <li>Option groups attached to variants.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class ProductOptionGroupAssignmentService {

  private final OptionGroupRepository optionGroupRepository;

  /**
   * Attaches all option groups declared in the product creation request.
   *
   * <p>This method orchestrates both:
   * <ul>
   *   <li>Product-level option group assignment.</li>
   *   <li>Variant-level option group assignment.</li>
   * </ul>
   *
   * <p>It also returns all option groups referenced by frontend clientIds,
   * regardless of whether they belong to the product level or variant level.
   *
   * @param product the product aggregate being created
   * @param request the product creation request
   * @param restaurant the current restaurant
   * @return creation-time option group references
   */
  public ProductOptionAssignmentResult assignOptionGroups(
    Product product,
    ProductCreateRequest request,
    Restaurant restaurant
  ) {
    ProductOptionAssignmentRegistry registry =
      new ProductOptionAssignmentRegistry();

    attachProductOptionGroups(
      product,
      request,
      restaurant,
      registry
    );

    attachOptionGroupsToVariants(
      product,
      request,
      restaurant,
      registry
    );

    return registry.toResult();
  }

  /**
   * Attaches product-level option groups.
   *
   * <p>A product-level option group can either:
   * <ul>
   *   <li>Reference an existing library option group using optionGroupId.</li>
   *   <li>Create a new custom option group when optionGroupId is absent.</li>
   * </ul>
   *
   * <p>Each resolved option group is registered by clientId so rules can target
   * it later during the same product creation workflow.
   */
  private void attachProductOptionGroups(
    Product product,
    ProductCreateRequest request,
    Restaurant restaurant,
    ProductOptionAssignmentRegistry registry
  ) {
    if (request.optionGroups() == null || request.optionGroups().isEmpty()) {
      product.setOptionGroups(List.of());
      return;
    }

    List<ProductOptionGroupLink> links = new ArrayList<>();

    for (ProductOptionGroupAssignmentRequest optionGroupRequest : request.optionGroups()) {
      OptionGroup optionGroup = resolveOrCreateProductOptionGroup(
        optionGroupRequest,
        restaurant
      );

      ProductOptionGroupLink link = ProductOptionGroupLink.builder()
        .product(product)
        .optionGroup(optionGroup)
        .requiredOverride(optionGroupRequest.requiredOverride())
        .minSelectOverride(optionGroupRequest.minSelectOverride())
        .maxSelectOverride(optionGroupRequest.maxSelectOverride())
        .displayOrder(optionGroupRequest.displayOrder())
        .build();

      attachOptionItemOverrides(link, optionGroupRequest);
      validateProductOptionGroupLink(link);

      links.add(link);

      registry.registerOptionGroup(
        optionGroupRequest.clientId(),
        optionGroup
      );
    }

    product.setOptionGroups(links);
  }

  /**
   * Attaches option groups to product variants.
   *
   * <p>Variant-level option groups currently reference existing option groups.
   * They do not create custom option groups because
   * {@link VariantOptionGroupAssignmentRequest} does not contain custom group
   * fields such as name, description or items.
   *
   * <p>Each resolved option group is also registered by clientId, allowing a
   * rule to target a variant-specific option group.
   */
  private void attachOptionGroupsToVariants(
    Product product,
    ProductCreateRequest request,
    Restaurant restaurant,
    ProductOptionAssignmentRegistry registry
  ) {
    if (product.getVariants() == null || request.variants() == null) {
      return;
    }

    int size = Math.min(
      product.getVariants().size(),
      request.variants().size()
    );

    for (int index = 0; index < size; index++) {
      ProductVariant variant = product.getVariants().get(index);
      ProductVariantRequest variantRequest = request.variants().get(index);

      if (variantRequest.optionGroups() == null || variantRequest.optionGroups().isEmpty()) {
        variant.setOptionGroups(List.of());
        continue;
      }

      List<VariantOptionGroup> links = new ArrayList<>();

      for (VariantOptionGroupAssignmentRequest optionGroupRequest : variantRequest.optionGroups()) {
        OptionGroup optionGroup = resolveVariantOptionGroup(
          optionGroupRequest,
          restaurant,
          registry
        );

        VariantOptionGroup link = VariantOptionGroup.builder()
          .variant(variant)
          .optionGroup(optionGroup)
          .requiredOverride(optionGroupRequest.requiredOverride())
          .minSelectOverride(optionGroupRequest.minSelectOverride())
          .maxSelectOverride(optionGroupRequest.maxSelectOverride())
          .includedSelectionsOverride(optionGroupRequest.includedSelectionsOverride())
          .displayOrder(optionGroupRequest.displayOrder())
          .build();

        validateVariantOptionGroupLink(link);

        links.add(link);
      }

      variant.setOptionGroups(links);
    }
  }

  /**
   * Resolves an existing option group for a variant.
   *
   * <p>Variant option groups must reference an existing option group because
   * the variant request only contains overrides and an optionGroupId.
   */
  private OptionGroup resolveVariantOptionGroup(
    VariantOptionGroupAssignmentRequest request,
    Restaurant restaurant,
    ProductOptionAssignmentRegistry registry
  ) {
    OptionGroup optionGroupFromDatabase =
      resolveOptionGroupFromDatabase(request.optionGroupId(), restaurant);

    OptionGroup optionGroupFromClientId =
      registry.findOptionGroup(request.optionGroupClientId());

    if (optionGroupFromDatabase != null) {
      if (
        optionGroupFromClientId != null
          && !sameOptionGroup(optionGroupFromClientId, optionGroupFromDatabase)
      ) {
        throw new IllegalArgumentException(
          "Variant option group has inconsistent optionGroupId and optionGroupClientId"
        );
      }

      registry.registerOptionGroup(
        request.optionGroupClientId(),
        optionGroupFromDatabase
      );

      return optionGroupFromDatabase;
    }

    if (request.optionGroupClientId() == null || request.optionGroupClientId().isBlank()) {
      throw new IllegalArgumentException(
        "Variant option group must reference either optionGroupId or optionGroupClientId"
      );
    }

    if (optionGroupFromClientId == null) {
      throw new IllegalArgumentException(
        "Unknown optionGroupClientId: " + request.optionGroupClientId()
      );
    }

    return optionGroupFromClientId;
  }

  private OptionGroup resolveOptionGroupFromDatabase(
    UUID optionGroupId,
    Restaurant restaurant
  ) {
    if (optionGroupId == null) {
      return null;
    }

    OptionGroup optionGroup = optionGroupRepository.findById(optionGroupId)
      .orElseThrow(() -> new OptionGroupsNotFoundException(
        List.of(optionGroupId)
      ));

    validateOptionGroupBelongsToRestaurant(optionGroup, restaurant);

    return optionGroup;
  }

  private boolean sameOptionGroup(
    OptionGroup first,
    OptionGroup second
  ) {
    if (first == second) {
      return true;
    }

    if (first == null || second == null) {
      return false;
    }

    if (first.getId() == null || second.getId() == null) {
      return false;
    }

    return first.getId().equals(second.getId());
  }

  /**
   * Resolves or creates a product-level option group.
   *
   * <p>If optionGroupId is present, the method resolves an existing library
   * option group.
   *
   * <p>If optionGroupId is absent, the method creates a custom option group
   * from the request payload.
   */
  private OptionGroup resolveOrCreateProductOptionGroup(
    ProductOptionGroupAssignmentRequest request,
    Restaurant restaurant
  ) {
    if (request.optionGroupId() != null) {
      OptionGroup optionGroup = optionGroupRepository.findById(request.optionGroupId())
        .orElseThrow(() -> new OptionGroupsNotFoundException(
          List.of(request.optionGroupId())
        ));

      validateOptionGroupBelongsToRestaurant(optionGroup, restaurant);

      return optionGroup;
    }

    OptionGroup customOptionGroup = createCustomOptionGroup(
      request,
      restaurant
    );

    return optionGroupRepository.save(customOptionGroup);
  }

  /**
   * Creates a custom option group from a product-level request.
   *
   * <p>This is only allowed for product-level option groups because the product
   * option group request contains the full data required to create a group:
   * name, description and items.
   */
  private OptionGroup createCustomOptionGroup(
    ProductOptionGroupAssignmentRequest request,
    Restaurant restaurant
  ) {
    if (request.name() == null || request.name().isBlank()) {
      throw new IllegalArgumentException("Custom option group name is required");
    }

    if (request.items() == null || request.items().isEmpty()) {
      throw new IllegalArgumentException(
        "Custom option group must contain at least one item"
      );
    }

    OptionGroup optionGroup = OptionGroup.builder()
      .restaurant(restaurant)
      .name(request.name().strip())
      .description(
        request.description() == null || request.description().isBlank()
          ? null
          : request.description().strip()
      )
      .required(Boolean.TRUE.equals(request.requiredOverride()))
      .minSelections(request.minSelectOverride() != null ? request.minSelectOverride() : 0)
      .maxSelections(
        request.maxSelectOverride() != null
          ? request.maxSelectOverride()
          : request.items().size()
      )
      .items(new ArrayList<>())
      .build();

    for (int index = 0; index < request.items().size(); index++) {
      var itemRequest = request.items().get(index);

      if (itemRequest.name() == null || itemRequest.name().isBlank()) {
        throw new IllegalArgumentException("Custom option item name is required");
      }

      OptionItem item = OptionItem.builder()
        .optionGroup(optionGroup)
        .name(itemRequest.name().trim())
        .description(itemRequest.description())
        .priceAdjustment(itemRequest.priceAdjustment())
        .isAvailable(itemRequest.isAvailable())
        .displayOrder(
          itemRequest.displayOrder() != null
            ? itemRequest.displayOrder()
            : index
        )
        .build();

      optionGroup.getItems().add(item);
    }

    return optionGroup;
  }

  /**
   * Applies item-level visibility overrides for existing library option groups.
   *
   * <p>Overrides are only allowed when the option group already exists in the
   * library. For newly created custom option groups, the item state should be
   * defined directly inside the custom items payload.
   */
  private void attachOptionItemOverrides(
    ProductOptionGroupLink link,
    ProductOptionGroupAssignmentRequest request
  ) {
    if (
      request.optionItemOverrides() != null
        && !request.optionItemOverrides().isEmpty()
        && request.optionGroupId() == null
    ) {
      throw new IllegalArgumentException(
        "Option item overrides are only allowed for existing library option groups"
      );
    }

    if (request.optionItemOverrides() == null || request.optionItemOverrides().isEmpty()) {
      return;
    }

    OptionGroup group = link.getOptionGroup();

    Map<UUID, OptionItem> itemsById = group.getItems()
      .stream()
      .collect(Collectors.toMap(OptionItem::getId, Function.identity()));

    for (ProductOptionItemOverrideRequest overrideRequest : request.optionItemOverrides()) {
      OptionItem item = itemsById.get(overrideRequest.optionItemId());

      if (item == null) {
        throw new IllegalArgumentException(
          "Option item does not belong to option group: "
            + overrideRequest.optionItemId()
        );
      }

      ProductOptionItemOverride override = ProductOptionItemOverride.builder()
        .productOptionGroupLink(link)
        .optionItem(item)
        .visible(overrideRequest.visible())
        .build();

      link.getItemOverrides().add(override);
    }
  }

  /**
   * Ensures that an option group belongs to the current restaurant.
   *
   * <p>This prevents a product from attaching option groups owned by another
   * restaurant.
   */
  private void validateOptionGroupBelongsToRestaurant(
    OptionGroup optionGroup,
    Restaurant restaurant
  ) {
    if (optionGroup.getRestaurant() == null || restaurant == null) {
      return;
    }

    if (!optionGroup.getRestaurant().getId().equals(restaurant.getId())) {
      throw new IllegalArgumentException(
        "Option group does not belong to the current restaurant: "
          + optionGroup.getId()
      );
    }
  }

  /**
   * Validates product-level option group constraints.
   *
   * <p>The final min/max/required values are computed from:
   * <ul>
   *   <li>The product-level override when present.</li>
   *   <li>The option group default otherwise.</li>
   * </ul>
   */
  private void validateProductOptionGroupLink(ProductOptionGroupLink link) {
    OptionGroup optionGroup = link.getOptionGroup();

    int visibleItemCount = countVisibleItemsForProduct(link);

    int min = link.getMinSelectOverride() != null
      ? link.getMinSelectOverride()
      : optionGroup.getMinSelections();

    int max = link.getMaxSelectOverride() != null
      ? link.getMaxSelectOverride()
      : optionGroup.getMaxSelections();

    boolean required = link.getRequiredOverride() != null
      ? link.getRequiredOverride()
      : optionGroup.isRequired();

    validateSelectionConstraints(
      required,
      min,
      max,
      visibleItemCount,
      "product option group"
    );
  }

  /**
   * Validates variant-level option group constraints.
   */
  private void validateVariantOptionGroupLink(VariantOptionGroup link) {
    OptionGroup optionGroup = link.getOptionGroup();

    int visibleItemCount = optionGroup.getItems() == null
      ? 0
      : optionGroup.getItems().size();

    int min = link.getMinSelectOverride() != null
      ? link.getMinSelectOverride()
      : optionGroup.getMinSelections();

    int max = link.getMaxSelectOverride() != null
      ? link.getMaxSelectOverride()
      : optionGroup.getMaxSelections();

    boolean required = link.getRequiredOverride() != null
      ? link.getRequiredOverride()
      : optionGroup.isRequired();

    validateSelectionConstraints(
      required,
      min,
      max,
      visibleItemCount,
      "variant option group"
    );

    Integer includedSelections = link.getIncludedSelectionsOverride();

    if (includedSelections != null && includedSelections < 0) {
      throw new IllegalArgumentException(
        "includedSelectionsOverride cannot be negative"
      );
    }

    if (includedSelections != null && includedSelections > max) {
      throw new IllegalArgumentException(
        "includedSelectionsOverride cannot be greater than maxSelectOverride"
      );
    }
  }

  /**
   * Shared validation for option group selection rules.
   */
  private void validateSelectionConstraints(
    boolean required,
    int min,
    int max,
    int visibleItemCount,
    String context
  ) {
    if (min < 0) {
      throw new IllegalArgumentException(
        "minSelectOverride cannot be negative for " + context
      );
    }

    if (max < 0) {
      throw new IllegalArgumentException(
        "maxSelectOverride cannot be negative for " + context
      );
    }

    if (required && min < 1) {
      throw new IllegalArgumentException(
        "Required option group must have minSelectOverride >= 1 for " + context
      );
    }

    if (required && max < 1) {
      throw new IllegalArgumentException(
        "Required option group must have maxSelectOverride >= 1 for " + context
      );
    }

    if (min > max) {
      throw new IllegalArgumentException(
        "minSelectOverride cannot be greater than maxSelectOverride for " + context
      );
    }

    if (max > visibleItemCount) {
      throw new IllegalArgumentException(
        "maxSelectOverride cannot exceed visible option items count for " + context
      );
    }
  }

  /**
   * Counts visible items after product-level item visibility overrides.
   */
  private int countVisibleItemsForProduct(ProductOptionGroupLink link) {
    if (link.getOptionGroup() == null || link.getOptionGroup().getItems() == null) {
      return 0;
    }

    return (int) link.getOptionGroup()
      .getItems()
      .stream()
      .filter(link::isItemVisibleForProduct)
      .count();
  }
}
