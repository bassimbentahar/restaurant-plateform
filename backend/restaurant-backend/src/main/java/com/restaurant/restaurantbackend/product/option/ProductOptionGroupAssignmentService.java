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
import jakarta.persistence.EntityManager;
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
 * <p>This service belongs to the product write side. It can be used during
 * product creation and product update.
 *
 * <p>Main responsibilities:
 * <ul>
 *   <li>Attach product-level option groups to the product.</li>
 *   <li>Attach variant-level option groups to product variants.</li>
 *   <li>Create custom product-level option groups when needed.</li>
 *   <li>Resolve existing library option groups by id.</li>
 *   <li>Validate option group ownership by restaurant.</li>
 *   <li>Validate selection constraints.</li>
 *   <li>Collect frontend temporary optionGroup clientIds for rule creation/update.</li>
 * </ul>
 *
 * <p>Important JPA rule:
 * <ul>
 *   <li>For managed entities, never replace orphanRemoval collections with a new List.</li>
 *   <li>Always mutate the existing collection in place using clear() and add().</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class ProductOptionGroupAssignmentService {

  private final OptionGroupRepository optionGroupRepository;
  private final EntityManager entityManager;

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

  private void attachProductOptionGroups(
    Product product,
    ProductCreateRequest request,
    Restaurant restaurant,
    ProductOptionAssignmentRegistry registry
  ) {
    if (request.optionGroups() == null || request.optionGroups().isEmpty()) {
      replaceProductOptionGroupsInPlace(product, List.of());
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

    replaceProductOptionGroupsInPlace(product, links);
  }

  private void replaceProductOptionGroupsInPlace(
    Product product,
    List<ProductOptionGroupLink> links
  ) {
    if (product.getOptionGroups() == null) {
      product.setOptionGroups(new ArrayList<>());
    }

    boolean hadExistingLinks = !product.getOptionGroups().isEmpty();

    product.getOptionGroups().clear();

    /*
     * Très important :
     * On force la suppression des anciens liens product/optionGroup
     * avant d’ajouter les nouveaux.
     */
    if (hadExistingLinks) {
      entityManager.flush();
    }

    if (links == null || links.isEmpty()) {
      return;
    }

    for (ProductOptionGroupLink link : links) {
      link.setProduct(product);
      product.getOptionGroups().add(link);
    }
  }

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
        replaceVariantOptionGroupsInPlace(variant, List.of());
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

      replaceVariantOptionGroupsInPlace(variant, links);
    }
  }

  private void replaceVariantOptionGroupsInPlace(
    ProductVariant variant,
    List<VariantOptionGroup> links
  ) {
    if (variant.getOptionGroups() == null) {
      variant.setOptionGroups(new ArrayList<>());
    }

    boolean hadExistingLinks = !variant.getOptionGroups().isEmpty();

    variant.getOptionGroups().clear();

    if (hadExistingLinks) {
      entityManager.flush();
    }

    if (links == null || links.isEmpty()) {
      return;
    }

    for (VariantOptionGroup link : links) {
      link.setVariant(variant);
      variant.getOptionGroups().add(link);
    }
  }

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
