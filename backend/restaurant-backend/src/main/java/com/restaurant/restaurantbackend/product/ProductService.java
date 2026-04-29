package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.category.CategoryRepository;
import com.restaurant.restaurantbackend.product.category.ProductCategory;
import com.restaurant.restaurantbackend.product.dto.request.ProductCreateRequest;
import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import com.restaurant.restaurantbackend.product.exception.CategoryNotFoundException;
import com.restaurant.restaurantbackend.product.exception.ProductNotFoundException;
import com.restaurant.restaurantbackend.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public List<ProductResponse> getProducts() {
        return productMapper.toProductResponses(productRepository.findAll());
    }

    public ProductResponse getProduct(UUID id) {
        return productMapper.toProductResponse(productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id)));
    }

    public @Nullable ProductResponse createProduct(ProductCreateRequest productCreateRequest) {
        UUID categoryId = productCreateRequest.categoryId();
        ProductCategory productCategory = categoryRepository
                .findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Product not found with ID: " + categoryId));
        Product newProduct = productRepository.save(productMapper.toEntity(productCreateRequest, productCategory));
        return productMapper.toProductResponse(newProduct);
    }
}
