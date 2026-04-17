package com.restaurant.restaurantbackend.product.mapper;

import com.restaurant.restaurantbackend.product.Product;

import com.restaurant.restaurantbackend.product.dto.request.ProductImageRequest;
import com.restaurant.restaurantbackend.product.dto.response.ProductImageResponse;
import com.restaurant.restaurantbackend.product.image.ProductImage;
import org.springframework.stereotype.Component;

@Component
public class ProductImageMapper {

  public ProductImageResponse toResponse(ProductImage image) {
    if (image == null) {
      return null;
    }

    return new ProductImageResponse(
      image.getUrl(),
      image.getAltText(),
      image.getDisplayOrder(),
      image.isPrimary()
    );
  }

  public ProductImage toEntity(ProductImageRequest request, Product product) {
    if (request == null) {
      return null;
    }

    ProductImage image = new ProductImage();
    image.setUrl(request.url());
    image.setAltText(request.altText());
    image.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
    image.setPrimary(request.isPrimary());
    image.setProduct(product);
    return image;
  }
}
