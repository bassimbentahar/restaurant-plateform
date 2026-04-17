package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.response.ProductSummaryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
public class ProductController {

  private final ProductService productService;

  public ProductController(ProductService productService){
    this.productService = productService;
  }
  @GetMapping("/products")
  public ResponseEntity<List<ProductSummaryResponse>> getProducts(){
    return ResponseEntity.ok(productService.getProducts());
  }
}
