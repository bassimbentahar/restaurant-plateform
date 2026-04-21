package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/v1")
@CrossOrigin(origins = "http://localhost:4200")public class ProductController {

  private final ProductService productService;

  public ProductController(ProductService productService){
    this.productService = productService;
  }
  @GetMapping("/products")
  public ResponseEntity<List<ProductResponse>> getProducts(){
    return ResponseEntity.ok(productService.getProducts());
  }

  @GetMapping("products/{id}")
  public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID id){
    return ResponseEntity.ok(productService.getProduct(id));
  }
}
