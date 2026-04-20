package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
