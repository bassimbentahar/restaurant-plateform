package com.restaurant.restaurantbackend.product.mapper;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.ProductStatus;
import com.restaurant.restaurantbackend.product.category.CategoryMapper;
import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;
import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryLink;
import com.restaurant.restaurantbackend.product.dto.ResolvedProduct;
import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.image.dto.ProductImageResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductSummaryResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductVariantResponse;
import com.restaurant.restaurantbackend.product.image.ProductImage;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class ProductMapper {

  private static final int DEFAULT_PREPARATION_TIME_MINUTES = 10;

  private final CategoryMapper categoryMapper;
  private final ProductImageMapper productImageMapper;
  private final ProductVariantMapper productVariantMapper;

  public ProductMapper(
    CategoryMapper categoryMapper,
    ProductImageMapper productImageMapper,
    ProductVariantMapper productVariantMapper
  ) {
    this.categoryMapper = categoryMapper;
    this.productImageMapper = productImageMapper;
    this.productVariantMapper = productVariantMapper;
  }

  public List<ProductSummaryResponse> toProductSummaryResponses(List<Product> products) {
    if (products == null || products.isEmpty()) {
      return List.of();
    }

    return products.stream()
      .map(this::toProductSummaryResponse)
      .toList();
  }

  public ProductSummaryResponse toProductSummaryResponse(Product product) {
    if (product == null) {
      return null;
    }

    return new ProductSummaryResponse(
      product.getId(),
      product.getSlug(),
      product.getTitle(),
      product.getShortDescription(),
      product.getThumb(),
      product.getBasePrice(),
      product.isAvailable(),
      product.isFeatured(),
      mapCategories(product)
    );
  }

  public ProductResponse toProductResponse(ResolvedProduct resolved) {
    if (resolved == null || resolved.product() == null) {
      return null;
    }

    Product product = resolved.product();

    List<ProductImageResponse> images = product.getImages() == null
      ? List.of()
      : product.getImages().stream()
      .map(productImageMapper::toResponse)
      .toList();

    List<ProductVariantResponse> variants = resolved.variants() == null
      ? List.of()
      : resolved.variants().stream()
      .map(productVariantMapper::toResponse)
      .toList();

    return new ProductResponse(
      product.getId(),
      product.getSku(),
      product.getSlug(),
      product.getTitle(),
      product.getShortDescription(),
      product.getDescription(),
      product.getThumb(),
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
      images,
      variants,
      product.getCreatedDate(),
      product.getLastModifiedDate()
    );
  }

  public Product toEntity(ProductCreateRequest request) {
    if (request == null) {
      return null;
    }

    Product product = new Product();


    product.setSku(trimToNull(request.sku()));
    product.setSlug(null);
    product.setTitle(trimToNull(request.title()));
    product.setShortDescription(trimToNull(request.shortDescription()));
    product.setDescription(trimToNull(request.description()));
    product.setThumb(trimToNull(request.thumb()));
    ProductStatus status = request.status() == null
      ? ProductStatus.DRAFT
      : request.status();

    product.setStatus(status);

    product.setBasePrice(request.basePrice());

    product.setAvailable(defaultTrue(request.isAvailable()));
    product.setFeatured(defaultFalse(request.isFeatured()));
    product.setArchived(
      status == ProductStatus.ARCHIVED || defaultFalse(request.isArchived())
    );

    product.setPreparationTimeMinutes(
      resolvePreparationTimeMinutes(request.preparationTimeMinutes())
    );

    product.setAvailableFrom(request.availableFrom());
    product.setAvailableTo(request.availableTo());
    product.setCalories(request.calories());
    product.setIngredientsText(trimToNull(request.ingredientsText()));
    product.setAllergensText(trimToNull(request.allergensText()));

    product.setImages(mapImages(request, product));
    product.setVariants(mapVariants(request, product));

    return product;
  }

  private List<ProductImage> mapImages(
    ProductCreateRequest request,
    Product product
  ) {
    if (request.images() == null || request.images().isEmpty()) {
      return new ArrayList<>();
    }

    List<ProductImage> images = new ArrayList<>();

    for (var imageRequest : request.images()) {
      images.add(productImageMapper.toEntity(imageRequest, product));
    }

    return images;
  }

  private List<ProductVariant> mapVariants(
    ProductCreateRequest request,
    Product product
  ) {
    if (request.variants() == null || request.variants().isEmpty()) {
      return new ArrayList<>();
    }

    List<ProductVariant> variants = new ArrayList<>();

    for (var variantRequest : request.variants()) {
      variants.add(productVariantMapper.toEntity(variantRequest, product));
    }

    return variants;
  }

  private List<ProductCategoryResponse> mapCategories(Product product) {
    if (product.getCategories() == null || product.getCategories().isEmpty()) {
      return List.of();
    }

    return categoryMapper.toProductCategoriesResponse(
      product.getCategories().stream()
        .sorted(
          Comparator.comparingInt(
            link -> link.getDisplayOrder() == null ? 0 : link.getDisplayOrder()
          )
        )
        .map(ProductCategoryLink::getCategory)
        .toList()
    );
  }

  private int resolvePreparationTimeMinutes(Integer preparationTimeMinutes) {
    if (preparationTimeMinutes == null) {
      return DEFAULT_PREPARATION_TIME_MINUTES;
    }

    return preparationTimeMinutes;
  }

  private boolean defaultTrue(Boolean value) {
    return value == null || value;
  }

  private boolean defaultFalse(Boolean value) {
    return Boolean.TRUE.equals(value);
  }

  private ProductStatus resolveStatus(ProductStatus status) {
    return status == null ? ProductStatus.DRAFT : status;
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmedValue = value.trim();

    return trimmedValue.isEmpty() ? null : trimmedValue;
  }
}
