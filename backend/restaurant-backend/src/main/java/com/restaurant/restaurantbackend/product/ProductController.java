package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductCreatedResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ProductController {

  private final ProductService productService;
  private final ProductCatalogQueryService productCatalogQueryService;

  @GetMapping("/products")
  public ResponseEntity<List<ProductResponse>> getProducts() {
    return ResponseEntity.ok(productCatalogQueryService.getProducts());
  }

  @GetMapping("/products/{id}")
  public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID id) {
    return ResponseEntity.ok(productCatalogQueryService.getProduct(id));
  }

  @PostMapping("/products")
  public ResponseEntity<ProductCreatedResponse> createProduct(
    @RequestBody ProductCreateRequest productCreateRequest
  ) {
    return ResponseEntity.ok(productService.createProduct(productCreateRequest));
  }
}
