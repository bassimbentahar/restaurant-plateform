package com.restaurant.restaurantbackend.product.category;

import com.restaurant.restaurantbackend.product.category.dto.ProductCategorySummaryResponse;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

  public ProductCategorySummaryResponse toProductSummaryResponse(ProductCategory category) {
    if (category == null) {
      return null;
    }

    return new ProductCategorySummaryResponse(
      category.getId(),
      category.getName(),
      category.getSlug()
    );
  }
}
