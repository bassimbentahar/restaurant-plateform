package com.restaurant.restaurantbackend.product.category;

import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryCreateRequest;
import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository categoryRepository;
  private final CategoryMapper categoryMapper;
  private final RestaurantRepository restaurantRepository;

  @Transactional(readOnly = true)
  public List<ProductCategoryResponse> getCategories(UUID restaurantId) {
    return categoryMapper.toProductCategoriesResponse(
      categoryRepository.findByRestaurantIdOrderByNameAsc(restaurantId)
    );
  }

  @Transactional
  public ProductCategoryResponse createCategory(
    UUID restaurantId,
    ProductCategoryCreateRequest request
  ) {
    if (request.name() == null || request.name().isBlank()) {
      throw new IllegalArgumentException("Category name is required");
    }

    Restaurant restaurant = restaurantRepository.findById(restaurantId)
      .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

    String name = request.name().trim();
    String slug = generateUniqueSlug(restaurantId, name);

    ProductCategory category = ProductCategory.builder()
      .restaurant(restaurant)
      .name(name)
      .slug(slug)
      .build();

    ProductCategory saved = categoryRepository.save(category);

    return new ProductCategoryResponse(
      saved.getId(),
      saved.getName(),
      saved.getSlug()
    );
  }

  private String generateUniqueSlug(UUID restaurantId, String value) {
    String baseSlug = slugify(value);

    if (baseSlug.isBlank()) {
      baseSlug = "categorie";
    }

    String candidate = baseSlug;
    int index = 2;

    while (categoryRepository.existsByRestaurantIdAndSlug(restaurantId, candidate)) {
      candidate = baseSlug + "-" + index;
      index++;
    }

    return candidate;
  }

  private String slugify(String value) {
    String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
      .replaceAll("\\p{M}", "");

    return normalized
      .toLowerCase(Locale.ROOT)
      .replaceAll("[^a-z0-9]+", "-")
      .replaceAll("^-+|-+$", "");
  }
}
