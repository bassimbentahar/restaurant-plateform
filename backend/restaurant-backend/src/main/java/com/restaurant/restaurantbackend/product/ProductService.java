package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductSummaryResponse;
import com.restaurant.restaurantbackend.product.exception.ProductNotFoundException;
import com.restaurant.restaurantbackend.product.mapper.ProductMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


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

    public ProductResponse getProduct(UUID id) {
      return productMapper.toProductResponse(productRepository.findById(id)
        .orElseThrow(()->new ProductNotFoundException("Product not found with ID: " + id)));
    }
}
