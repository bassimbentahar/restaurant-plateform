package com.restaurant.restaurantbackend.product.category.productCategoryLink;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.category.CategoryRepository;
import com.restaurant.restaurantbackend.product.category.ProductCategory;
import com.restaurant.restaurantbackend.product.exception.CategoriesNotFoundException;
import com.restaurant.restaurantbackend.product.exception.CategoryNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductCategoryAssignmentService {

  private final CategoryRepository categoryRepository;

  public List<ProductCategoryLink> createCategoryLinks(
    Product product,
    UUID restaurantId,
    List<UUID> requestedCategoryIds
  ) {
    List<UUID> categoryIds = normalizeCategoryIds(requestedCategoryIds);

    List<ProductCategory> categories =
      categoryRepository.findByRestaurantIdAndIdIn(restaurantId, categoryIds);

    validateAllCategoriesFound(categoryIds, categories);

    return buildCategoryLinks(product, categoryIds, categories);
  }

  private List<UUID> normalizeCategoryIds(List<UUID> requestedCategoryIds) {
    if (requestedCategoryIds == null || requestedCategoryIds.isEmpty()) {
      throw new CategoryNotFoundException(
        "Product creation failed: no categories provided"
      );
    }

    Set<UUID> distinctCategoryIds = new LinkedHashSet<>(requestedCategoryIds);

    return distinctCategoryIds.stream().toList();
  }

  private void validateAllCategoriesFound(
    List<UUID> requestedCategoryIds,
    List<ProductCategory> foundCategories
  ) {
    List<UUID> foundIds = foundCategories.stream()
      .map(ProductCategory::getId)
      .toList();

    List<UUID> missingIds = requestedCategoryIds.stream()
      .filter(id -> !foundIds.contains(id))
      .toList();

    if (!missingIds.isEmpty()) {
      throw new CategoriesNotFoundException(missingIds);
    }
  }

  private List<ProductCategoryLink> buildCategoryLinks(
    Product product,
    List<UUID> requestedCategoryIds,
    List<ProductCategory> categories
  ) {
    List<ProductCategoryLink> links = new ArrayList<>();

    for (int index = 0; index < requestedCategoryIds.size(); index++) {
      UUID categoryId = requestedCategoryIds.get(index);

      ProductCategory category = findCategoryById(categories, categoryId);

      ProductCategoryLink link = ProductCategoryLink.builder()
        .product(product)
        .category(category)
        .displayOrder(index)
        .build();

      links.add(link);
    }

    return links;
  }

  private ProductCategory findCategoryById(
    List<ProductCategory> categories,
    UUID categoryId
  ) {
    return categories.stream()
      .filter(category -> category.getId().equals(categoryId))
      .findFirst()
      .orElseThrow(() -> new CategoriesNotFoundException(List.of(categoryId)));
  }
}
