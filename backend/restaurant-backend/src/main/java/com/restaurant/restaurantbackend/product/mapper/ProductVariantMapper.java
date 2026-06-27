package com.restaurant.restaurantbackend.product.mapper;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.dto.ResolvedProductVariant;
import com.restaurant.restaurantbackend.product.variant.dto.ProductVariantRequest;
import com.restaurant.restaurantbackend.product.dto.response.ProductOptionGroupResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductVariantResponse;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class ProductVariantMapper {

  private final ProductOptionGroupMapper optionGroupMapper;

  public ProductVariantMapper(ProductOptionGroupMapper optionGroupMapper) {
    this.optionGroupMapper = optionGroupMapper;
  }

  public ProductVariantResponse toResponse(ResolvedProductVariant resolved) {
    ProductVariant variant = resolved.variant();

    List<ProductOptionGroupResponse> optionGroups = resolved.optionGroups() == null
      ? List.of()
      : resolved.optionGroups().stream()
      .map(optionGroupMapper::toResponse)
      .toList();

    return new ProductVariantResponse(
      variant.getId(),
      variant.getName(),
      variant.getSku(),
      variant.calculateFinalPrice(),
      variant.getCompareAtPrice(),
      variant.isDefault(),
      variant.isAvailable(),
      variant.getDisplayOrder(),
      optionGroups
    );
  }

  public ProductVariant toEntity(ProductVariantRequest request, Product product) {
    if (request == null) {
      return null;
    }

    ProductVariant variant = new ProductVariant();
    variant.setName(request.name());
    variant.setSku(request.sku());
    variant.setPriceAdjustment(
      request.priceAdjustment() != null ? request.priceAdjustment() : BigDecimal.ZERO
    );
    variant.setCompareAtPrice(request.compareAtPrice());
    variant.setDefault(request.isDefault());
    variant.setAvailable(request.isAvailable());
    variant.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
    variant.setProduct(product);

    return variant;
  }
}
