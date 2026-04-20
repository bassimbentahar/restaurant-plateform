package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductSummaryResponse;
import com.restaurant.restaurantbackend.product.mapper.ProductMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final ProductMapper productMapper;

  public ProductService(ProductRepository productRepository, ProductMapper productMapper) {
    this.productRepository = productRepository;
    this.productMapper = productMapper;
  }

  public List<ProductResponse> getProducts() {
    return productMapper.toProductResponses(productRepository.findAll());
  }
}
