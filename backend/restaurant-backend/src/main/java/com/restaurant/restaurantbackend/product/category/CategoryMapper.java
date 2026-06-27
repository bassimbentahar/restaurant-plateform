package com.restaurant.restaurantbackend.product.category;

import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryMapper {

  public List<ProductCategoryResponse> toProductCategoriesResponse(
    List<ProductCategory> categories
  ) {

    if (categories == null) {
      return List.of();
    }

    return categories
      .stream()
      .map(category -> new ProductCategoryResponse(
        category.getId(),
        category.getName(),
        category.getSlug()
      ))
      .toList();
  }
}
