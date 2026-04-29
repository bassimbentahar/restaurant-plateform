package com.restaurant.restaurantbackend.product.mapper;

import java.util.ArrayList;
import java.util.List;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.category.CategoryMapper;
import com.restaurant.restaurantbackend.product.category.ProductCategory;
import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.dto.response.*;
import com.restaurant.restaurantbackend.product.image.ProductImage;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

  private final CategoryMapper categoryMapper;
  private final ProductImageMapper productImageMapper;
  private final ProductVariantMapper productVariantMapper;
  private final ProductOptionGroupMapper optionGroupMapper;

  public ProductMapper(
    CategoryMapper categoryMapper,
    ProductImageMapper productImageMapper,
    ProductVariantMapper productVariantMapper,
    ProductOptionGroupMapper optionGroupMapper
  ) {
    this.categoryMapper = categoryMapper;
    this.productImageMapper = productImageMapper;
    this.productVariantMapper = productVariantMapper;
    this.optionGroupMapper = optionGroupMapper;
  }

  public List<ProductSummaryResponse> toProductSummaryResponses(List<Product> products) {
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
      categoryMapper.toProductSummaryResponse(product.getCategory())
    );
  }

  public List<ProductResponse> toProductResponses(List<Product> products) {
    if (products == null) return null;
    return products.stream()
      .map(this::toProductResponse)
      .toList();
  }

  public ProductResponse toProductResponse(Product product) {
    if (product == null) {
      return null;
    }

    List<ProductImageResponse> images = product.getImages() == null
      ? List.of()
      : product.getImages().stream()
      .map(productImageMapper::toResponse)
      .toList();

    List<ProductVariantResponse> variants = product.getVariants() == null
      ? List.of()
      : product.getVariants().stream()
      .map(variant -> productVariantMapper.toResponse(variant, product))
      .toList();

    List<ProductOptionGroupResponse> optionGroups = product.getOptionGroups() == null
      ? List.of()
      : product.getOptionGroups().stream()
      .map(optionGroupMapper::toResponse)
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
      categoryMapper.toProductSummaryResponse(product.getCategory()),
      images,
      variants,
      optionGroups,
      product.getCreatedDate(),
      product.getLastModifiedDate()
    );
  }

  public Product toEntity(ProductCreateRequest request, ProductCategory category) {
    if (request == null) {
      return null;
    }

    Product product = new Product();
    product.setSku(request.sku());
    product.setSlug(request.slug());
    product.setTitle(request.title());
    product.setShortDescription(request.shortDescription());
    product.setDescription(request.description());
    product.setThumb(request.thumb());
    product.setBasePrice(request.basePrice());
    product.setAvailable(request.isAvailable());
    product.setFeatured(request.isFeatured());
    product.setArchived(request.isArchived());
    product.setPreparationTimeMinutes(request.preparationTimeMinutes());
    product.setAvailableFrom(request.availableFrom());
    product.setAvailableTo(request.availableTo());
    product.setCalories(request.calories());
    product.setIngredientsText(request.ingredientsText());
    product.setAllergensText(request.allergensText());
    product.setCategory(category);

    List<ProductImage> images = new ArrayList<>();
    if (request.images() != null) {
      for (var imageRequest : request.images()) {
        images.add(productImageMapper.toEntity(imageRequest, product));
      }
    }
    product.setImages(images);

    List<ProductVariant> variants = new ArrayList<>();
    if (request.variants() != null) {
      for (var variantRequest : request.variants()) {
        variants.add(productVariantMapper.toEntity(variantRequest, product));
      }
    }
    product.setVariants(variants);

    List<OptionGroup> optionGroups = new ArrayList<>();
    if (request.optionGroups() != null) {
      for (var optionGroupRequest : request.optionGroups()) {
        optionGroups.add(optionGroupMapper.toEntity(optionGroupRequest));
      }
    }
    product.setOptionGroups(optionGroups);

    return product;
  }
}
