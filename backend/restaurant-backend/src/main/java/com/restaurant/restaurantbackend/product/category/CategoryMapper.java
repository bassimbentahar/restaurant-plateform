package com.restaurant.restaurantbackend.product.category;

import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

  public ProductCategoryResponse toProductSummaryResponse(ProductCategory category) {
    if (category == null) {
      return null;
    }

    return new ProductCategoryResponse(
      category.getId(),
      category.getName(),
      category.getSlug()
    );
  }
}
