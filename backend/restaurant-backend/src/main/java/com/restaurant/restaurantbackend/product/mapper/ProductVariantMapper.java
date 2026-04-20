package com.restaurant.restaurantbackend.product.mapper;

import com.restaurant.restaurantbackend.product.Product;
import java.math.BigDecimal;

import com.restaurant.restaurantbackend.product.dto.request.ProductVariantRequest;
import com.restaurant.restaurantbackend.product.dto.response.ProductVariantResponse;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

  public ProductVariantResponse toResponse(ProductVariant variant, Product product) {
    if (variant == null) {
      return null;
    }

    BigDecimal productBasePrice = product != null && product.getBasePrice() != null
      ? product.getBasePrice()
      : BigDecimal.ZERO;

    BigDecimal priceAdjustment = variant.getPriceAdjustment() != null
      ? variant.getPriceAdjustment()
      : BigDecimal.ZERO;

    BigDecimal variantBasePrice = productBasePrice.add(priceAdjustment);

    return new ProductVariantResponse(
      variant.getId(),
      variant.getName(),
      variantBasePrice,
      null,
      variant.isDefault(),
      variant.isAvailable(),
      variant.getDisplayOrder()
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
    variant.setDefault(request.isDefault());
    variant.setAvailable(request.isAvailable());
    variant.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
    variant.setProduct(product);
    return variant;
  }
}
