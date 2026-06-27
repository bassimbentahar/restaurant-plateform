package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryAssignmentService;
import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryLink;
import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductCreatedResponse;
import com.restaurant.restaurantbackend.product.mapper.ProductMapper;
import com.restaurant.restaurantbackend.product.option.ProductOptionAssignmentResult;
import com.restaurant.restaurantbackend.product.option.ProductOptionGroupAssignmentService;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleApplicationService;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleDuplicatePolicyService;
import com.restaurant.restaurantbackend.product.slug.ProductSlugService;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Application service responsible for product creation.
 *
 * <p>This service represents the write side of the product catalog.
 * Its responsibility is to assemble and persist a complete {@link Product}
 * aggregate from a creation request.
 *
 * <p>Main responsibilities:
 * <ul>
 *   <li>Resolve the current restaurant context.</li>
 *   <li>Map the incoming request to a {@link Product} entity.</li>
 *   <li>Attach product categories.</li>
 *   <li>Attach product-level option groups.</li>
 *   <li>Attach variant-level option groups.</li>
 *   <li>Build temporary clientId references used by rule creation.</li>
 *   <li>Validate product and variant consistency rules.</li>
 *   <li>Persist the product aggregate.</li>
 *   <li>Delegate restaurant rule creation to {@link RestaurantRuleApplicationService}.</li>
 * </ul>
 *
 * <p>This service intentionally does not resolve catalog output for clients.
 * Reading, option resolution and dynamic rule execution are handled by the
 * query side, especially {@code ProductCatalogQueryService} and
 * {@code OptionGroupResolutionService}.
 *
 * <p>Creation flow:
 * <pre>
 * ProductService
 *   -> ProductMapper
 *   -> ProductCategoryAssignmentService
 *   -> ProductOptionGroupAssignmentService
 *   -> ProductRepository
 *   -> RestaurantRuleApplicationService
 * </pre>
 *
 * <p>Important distinction:
 * <ul>
 *   <li>{@code variantsByClientId} maps frontend temporary variant IDs to real variants.</li>
 *   <li>{@code optionGroupsByClientId} maps frontend temporary option group IDs to real option groups.</li>
 * </ul>
 *
 * <p>These maps are technical creation-time references only. They are not part
 * of the public API response.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

  private static final UUID DEFAULT_RESTAURANT_ID =
    UUID.fromString("01000000-0000-0000-0000-000000000001");

  // TODO: Replace this temporary fallback with the restaurant id from the JWT.
  private final ProductRepository productRepository;
  private final ProductMapper productMapper;
  private final RestaurantRepository restaurantRepository;
  private final ProductCategoryAssignmentService productCategoryAssignmentService;
  private final ProductOptionGroupAssignmentService productOptionGroupAssignmentService;
  private final RestaurantRuleApplicationService restaurantRuleApplicationService;
  private final ProductSlugService slugService;
  private final RestaurantRuleDuplicatePolicyService ruleDuplicatePolicyService;
  /**
   * Creates a product and all creation-time relationships.
   *
   * <p>The product is first assembled in memory:
   * <ul>
   *   <li>Product base data and variants are created by the mapper.</li>
   *   <li>Categories are attached to the product.</li>
   *   <li>Product-level and variant-level option groups are attached.</li>
   *   <li>Temporary clientId references are collected for later rule assignment.</li>
   * </ul>
   *
   * <p>The product is persisted before creating rules because rule assignments
   * need to reference persisted product, variant and option group entities.
   *
   * @param request the product creation request
   * @return the id of the created product
   */
  @Transactional
  public ProductCreatedResponse createProduct(ProductCreateRequest request) {
    Objects.requireNonNull(request, "Product creation request must not be null");

    Restaurant restaurant = getCurrentRestaurant();

    ruleDuplicatePolicyService.validateProductRules(request.rules());

    Product product = productMapper.toEntity(request);
    product.setRestaurant(restaurant);

    product.setSlug(
      slugService.generateUniqueSlug(
        restaurant.getId(),
        request.slug(),
        request.title()
      )
    );

    List<ProductCategoryLink> categoryLinks =
      productCategoryAssignmentService.createCategoryLinks(
        product,
        restaurant.getId(),
        request.categoryIds()
      );

    product.setCategories(categoryLinks);

    ProductOptionAssignmentResult optionAssignmentResult =
      productOptionGroupAssignmentService.assignOptionGroups(
        product,
        request,
        restaurant
      );

    Map<String, ProductVariant> variantsByClientId =
      buildVariantMap(product, request);

    validateAndNormalizeDefaultVariant(product);
    validateVariantCompareAtPrices(product);

    Product savedProduct = productRepository.saveAndFlush(product);

    restaurantRuleApplicationService.createRulesForProduct(
      savedProduct,
      restaurant,
      request.rules(),
      variantsByClientId,
      optionAssignmentResult.optionGroupsByClientId()
    );

    return new ProductCreatedResponse(savedProduct.getId());
  }

  /**
   * Builds a temporary map between frontend variant clientIds and backend
   * {@link ProductVariant} instances.
   *
   * <p>This map is only needed during product creation. It allows
   * {@link RestaurantRuleApplicationService} to resolve rules targeting a
   * variant using the temporary clientId sent by the frontend.
   *
   * <p>This method does not create, update or persist variants. It only creates
   * a lookup map from already mapped variants.
   *
   * @param product the product aggregate created from the request
   * @param request the original creation request containing frontend clientIds
   * @return map of clientId to product variant
   */
  private Map<String, ProductVariant> buildVariantMap(
    Product product,
    ProductCreateRequest request
  ) {
    Map<String, ProductVariant> variantsByClientId = new HashMap<>();

    if (product.getVariants() == null || request.variants() == null) {
      return variantsByClientId;
    }

    int size = Math.min(
      product.getVariants().size(),
      request.variants().size()
    );

    for (int index = 0; index < size; index++) {
      String clientId = request.variants().get(index).clientId();

      if (clientId == null || clientId.isBlank()) {
        continue;
      }

      if (variantsByClientId.containsKey(clientId)) {
        throw new IllegalArgumentException(
          "Duplicate variant clientId: " + clientId
        );
      }

      variantsByClientId.put(
        clientId,
        product.getVariants().get(index)
      );
    }

    return variantsByClientId;
  }

  /**
   * Ensures that the product contains at most one default variant.
   *
   * <p>If no variant is marked as default, the first variant becomes the
   * default one automatically.
   *
   * @param product the product being validated
   */
  private void validateAndNormalizeDefaultVariant(Product product) {
    if (product.getVariants() == null || product.getVariants().isEmpty()) {
      return;
    }

    long defaultCount = product.getVariants().stream()
      .filter(ProductVariant::isDefault)
      .count();

    if (defaultCount > 1) {
      throw new IllegalArgumentException(
        "Only one variant can be default"
      );
    }

    if (defaultCount == 0) {
      product.getVariants().getFirst().setDefault(true);
    }
  }

  /**
   * Validates compare-at prices for all variants.
   *
   * <p>The compare-at price represents the original or reference price shown
   * to customers when a variant is discounted.
   *
   * <p>Rules:
   * <ul>
   *   <li>The compare-at price cannot be negative.</li>
   *   <li>The compare-at price must be greater than the final variant price.</li>
   * </ul>
   *
   * @param product the product being validated
   */
  private void validateVariantCompareAtPrices(Product product) {
    if (product.getVariants() == null) {
      return;
    }

    for (ProductVariant variant : product.getVariants()) {
      BigDecimal compareAtPrice = variant.getCompareAtPrice();

      if (compareAtPrice == null) {
        continue;
      }

      if (compareAtPrice.compareTo(BigDecimal.ZERO) < 0) {
        throw new IllegalArgumentException(
          "compareAtPrice cannot be negative for variant: " + variant.getName()
        );
      }

      BigDecimal finalPrice = variant.calculateFinalPrice();

      if (compareAtPrice.compareTo(finalPrice) <= 0) {
        throw new IllegalArgumentException(
          "compareAtPrice must be greater than variant price for variant: "
            + variant.getName()
        );
      }
    }
  }

  /**
   * Resolves the current restaurant.
   *
   * <p>This is temporary. In production, the restaurant must come from the
   * authenticated user context, usually through JWT claims.
   *
   * @return the current restaurant
   */
  private Restaurant getCurrentRestaurant() {
    return restaurantRepository.findById(DEFAULT_RESTAURANT_ID)
      .orElseThrow(() -> new IllegalStateException(
        "Default restaurant not found: " + DEFAULT_RESTAURANT_ID
      ));
  }
}
