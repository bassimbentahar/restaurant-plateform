package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/products")
public class ProductAdminController {

  private final ProductAdminQueryService productAdminQueryService;
  private final ProductService productService;

  @GetMapping("/{id}/edit")
  public ResponseEntity<ProductEditResponse> getProductForEdit(
    @PathVariable UUID id
  ) {
    return ResponseEntity.ok(productAdminQueryService.getProductForEdit(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ProductEditResponse> updateProduct(
    @PathVariable UUID id,
    @RequestBody ProductCreateRequest request
  ) {
    productService.updateProduct(id, request);

    return ResponseEntity.ok(productAdminQueryService.getProductForEdit(id));
  }
}
