package com.restaurant.restaurantbackend.product.category;

import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryCreateRequest;
import com.restaurant.restaurantbackend.product.category.dto.ProductCategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/restaurants/{restaurantId}/categories")
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping
  public ResponseEntity<List<ProductCategoryResponse>> getCategories(
    @PathVariable UUID restaurantId
  ) {
    return ResponseEntity.ok(categoryService.getCategories(restaurantId));
  }

  @PostMapping
  public ResponseEntity<ProductCategoryResponse> createCategory(
    @PathVariable UUID restaurantId,
    @RequestBody ProductCategoryCreateRequest request
  ) {
    return ResponseEntity.ok(categoryService.createCategory(restaurantId, request));
  }
}
