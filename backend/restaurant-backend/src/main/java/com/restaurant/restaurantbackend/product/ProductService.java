package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryAssignmentService;
import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryLink;
import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductCreatedResponse;
import com.restaurant.restaurantbackend.product.exception.ProductNotFoundException;
import com.restaurant.restaurantbackend.product.image.ProductImage;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Application service responsible for product writes.
 *
 * <p>This service represents the write side of the product catalog.
 * Its responsibility is to assemble, update and persist a complete
 * {@link Product} aggregate from an admin request.
 *
 * <p>Main responsibilities:
 * <ul>
 *   <li>Resolve the current restaurant context.</li>
 *   <li>Create a complete product aggregate.</li>
 *   <li>Update an existing product aggregate.</li>
 *   <li>Attach product categories.</li>
 *   <li>Attach product-level option groups.</li>
 *   <li>Attach variant-level option groups.</li>
 *   <li>Build temporary clientId references used by rule creation/update.</li>
 *   <li>Validate product and variant consistency rules.</li>
 *   <li>Delegate restaurant rule creation/update to {@link RestaurantRuleApplicationService}.</li>
 * </ul>
 *
 * <p>This service intentionally does not resolve catalog output for clients.
 * Reading, option resolution and dynamic rule execution are handled by the
 * query side, especially {@code ProductCatalogQueryService},
 * {@code ProductAdminQueryService} and {@code OptionGroupResolutionService}.
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
   * Updates an existing product and rebuilds its editable relationships.
   *
   * <p>This method follows the same structure as {@link #createProduct(ProductCreateRequest)}
   * but works on an already persisted product:
   * <ul>
   *   <li>The existing product is loaded and validated against the current restaurant.</li>
   *   <li>Main product fields are updated in place.</li>
   *   <li>Images and variants are rebuilt from the request.</li>
   *   <li>Categories are rebuilt from categoryIds.</li>
   *   <li>Product-level and variant-level option groups are reassigned.</li>
   *   <li>Rules are replaced through {@link RestaurantRuleApplicationService}.</li>
   * </ul>
   *
   * <p>Important: this method does not create a new {@link Product}. It mutates
   * the existing aggregate so that the original id, audit fields and ownership
   * remain stable.
   *
   * @param productId the existing product id
   * @param request the update request
   * @return the id of the updated product
   */
  @Transactional
  public ProductCreatedResponse updateProduct(
    UUID productId,
    ProductCreateRequest request
  ) {
    Objects.requireNonNull(productId, "Product id must not be null");
    Objects.requireNonNull(request, "Product update request must not be null");

    Restaurant restaurant = getCurrentRestaurant();

    ruleDuplicatePolicyService.validateProductRules(request.rules());

    Product product = findProductForCurrentRestaurant(productId, restaurant);

    Product mappedProduct = productMapper.toEntity(request);

    updateMainProductFields(product, mappedProduct, request, restaurant);

    replaceImages(product, mappedProduct.getImages());
    replaceVariants(product, mappedProduct.getVariants());

    replaceCategories(product, restaurant, request);

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

    productRepository.flush();

    /*
     * Clean architecture:
     * The product service owns product writes, but rule persistence details
     * remain inside RestaurantRuleApplicationService.
     *
     * If this method does not exist yet in RestaurantRuleApplicationService,
     * add it there rather than deleting/recreating rules here.
     */
    restaurantRuleApplicationService.replaceRulesForProduct(
      product,
      restaurant,
      request.rules(),
      variantsByClientId,
      optionAssignmentResult.optionGroupsByClientId()
    );

    return new ProductCreatedResponse(product.getId());
  }

  private Product findProductForCurrentRestaurant(
    UUID productId,
    Restaurant restaurant
  ) {
    Product product = productRepository.findById(productId)
      .orElseThrow(() -> new ProductNotFoundException(
        "Product not found with ID: " + productId
      ));

    if (
      product.getRestaurant() == null
        || product.getRestaurant().getId() == null
        || !product.getRestaurant().getId().equals(restaurant.getId())
    ) {
      throw new ProductNotFoundException(
        "Product not found with ID: " + productId
      );
    }

    return product;
  }

  private void updateMainProductFields(
    Product product,
    Product mappedProduct,
    ProductCreateRequest request,
    Restaurant restaurant
  ) {
    product.setRestaurant(restaurant);

    product.setSku(mappedProduct.getSku());
    product.setTitle(mappedProduct.getTitle());
    product.setShortDescription(mappedProduct.getShortDescription());
    product.setDescription(mappedProduct.getDescription());
    product.setThumb(mappedProduct.getThumb());

    product.setSlug(
      resolveSlugForUpdate(
        product,
        restaurant,
        request.slug()
      )
    );

    product.setBasePrice(mappedProduct.getBasePrice());

    product.setAvailable(mappedProduct.isAvailable());
    product.setFeatured(mappedProduct.isFeatured());
    product.setArchived(mappedProduct.isArchived());

    product.setPreparationTimeMinutes(
      mappedProduct.getPreparationTimeMinutes()
    );

    product.setAvailableFrom(mappedProduct.getAvailableFrom());
    product.setAvailableTo(mappedProduct.getAvailableTo());

    product.setCalories(mappedProduct.getCalories());
    product.setIngredientsText(mappedProduct.getIngredientsText());
    product.setAllergensText(mappedProduct.getAllergensText());
  }

  private String resolveSlugForUpdate(
    Product product,
    Restaurant restaurant,
    String requestedSlug
  ) {
    String cleanedRequestedSlug = trimToNull(requestedSlug);

    if (cleanedRequestedSlug == null) {
      return product.getSlug();
    }

    if (cleanedRequestedSlug.equals(product.getSlug())) {
      return product.getSlug();
    }

    return slugService.generateUniqueSlug(
      restaurant.getId(),
      cleanedRequestedSlug,
      product.getTitle()
    );
  }

  private void replaceImages(
    Product product,
    List<ProductImage> newImages
  ) {
    validatePrimaryImageCount(newImages);

    if (product.getImages() == null) {
      product.setImages(new ArrayList<>());
    }

    boolean hadExistingImages = !product.getImages().isEmpty();

    product.getImages().clear();

    /*
     * Important :
     * On force Hibernate à supprimer les anciennes images avant d’insérer
     * les nouvelles. Sinon PostgreSQL peut voir deux images principales
     * pour le même produit pendant le même flush.
     */
    if (hadExistingImages) {
      productRepository.flush();
    }

    if (newImages == null || newImages.isEmpty()) {
      return;
    }

    for (ProductImage image : new ArrayList<>(newImages)) {
      image.setProduct(product);
      product.getImages().add(image);
    }
  }

  private void validatePrimaryImageCount(
    List<ProductImage> images
  ) {
    if (images == null || images.isEmpty()) {
      return;
    }

    long primaryImageCount = images.stream()
      .filter(ProductImage::isPrimary)
      .count();

    if (primaryImageCount > 1) {
      throw new IllegalArgumentException(
        "Only one primary image is allowed per product"
      );
    }
  }

  private void replaceVariants(
    Product product,
    List<ProductVariant> newVariants
  ) {
    validateVariantSkus(newVariants);

    if (product.getVariants() == null) {
      product.setVariants(new ArrayList<>());
    }

    boolean hadExistingVariants = !product.getVariants().isEmpty();

    product.getVariants().clear();

    /*
     * Important :
     * On force Hibernate à supprimer les anciennes variantes avant
     * d’insérer les nouvelles.
     *
     * Sinon, si une nouvelle variante garde le même SKU qu’une ancienne,
     * PostgreSQL voit temporairement deux lignes avec le même SKU.
     */
    if (hadExistingVariants) {
      productRepository.flush();
    }

    if (newVariants == null || newVariants.isEmpty()) {
      return;
    }

    for (ProductVariant variant : new ArrayList<>(newVariants)) {
      variant.setProduct(product);

      if (variant.getOptionGroups() == null) {
        variant.setOptionGroups(new ArrayList<>());
      } else {
        variant.setOptionGroups(new ArrayList<>(variant.getOptionGroups()));
      }

      product.getVariants().add(variant);
    }
  }

  private void replaceCategories(
    Product product,
    Restaurant restaurant,
    ProductCreateRequest request
  ) {
    validateCategoryIds(request.categoryIds());

    if (product.getCategories() == null) {
      product.setCategories(new ArrayList<>());
    }

    boolean hadExistingCategories = !product.getCategories().isEmpty();

    product.getCategories().clear();

    /*
     * Important :
     * On force Hibernate à supprimer les anciens liens product/category
     * avant d’insérer les nouveaux.
     *
     * Sinon PostgreSQL peut voir temporairement deux fois le même couple :
     * product_id + category_id.
     */
    if (hadExistingCategories) {
      productRepository.flush();
    }

    List<ProductCategoryLink> categoryLinks =
      productCategoryAssignmentService.createCategoryLinks(
        product,
        restaurant.getId(),
        request.categoryIds()
      );

    if (categoryLinks.isEmpty()) {
      return;
    }

    product.getCategories().addAll(categoryLinks);
  }

  /**
   * Builds a temporary map between frontend variant clientIds and backend
   * {@link ProductVariant} instances.
   *
   * <p>This map is needed during product creation and update. It allows
   * {@link RestaurantRuleApplicationService} to resolve rules targeting a
   * variant using the temporary clientId sent by the frontend.
   *
   * @param product the product aggregate created or updated from the request
   * @param request the original request containing frontend clientIds
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

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmedValue = value.trim();

    return trimmedValue.isEmpty() ? null : trimmedValue;
  }

  private void validateVariantSkus(
    List<ProductVariant> variants
  ) {
    if (variants == null || variants.isEmpty()) {
      return;
    }

    List<String> skus = variants.stream()
      .map(ProductVariant::getSku)
      .filter(sku -> sku != null && !sku.isBlank())
      .map(String::strip)
      .toList();

    long distinctSkuCount = skus.stream()
      .distinct()
      .count();

    if (distinctSkuCount != skus.size()) {
      throw new IllegalArgumentException(
        "Duplicate variant sku in product request"
      );
    }
  }

  private void validateCategoryIds(
    List<UUID> categoryIds
  ) {
    if (categoryIds == null || categoryIds.isEmpty()) {
      return;
    }

    List<UUID> cleanCategoryIds = categoryIds.stream()
      .filter(Objects::nonNull)
      .toList();

    long distinctCount = cleanCategoryIds.stream()
      .distinct()
      .count();

    if (distinctCount != cleanCategoryIds.size()) {
      throw new IllegalArgumentException(
        "Duplicate category id in product request"
      );
    }
  }
}
