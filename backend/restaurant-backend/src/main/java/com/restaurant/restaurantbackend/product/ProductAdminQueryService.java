package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.response.admin.ProductEditResponse;
import com.restaurant.restaurantbackend.product.exception.ProductNotFoundException;
import com.restaurant.restaurantbackend.product.mapper.ProductEditMapper;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleAssignment;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductAdminQueryService {

  private final ProductRepository productRepository;
  private final RestaurantRuleAssignmentRepository ruleAssignmentRepository;
  private final ProductEditMapper productEditMapper;

  public ProductEditResponse getProductForEdit(UUID productId) {
    Product product = productRepository.findById(productId)
      .orElseThrow(() -> new ProductNotFoundException(
        "Product not found with ID: " + productId
      ));

    List<RestaurantRuleAssignment> ruleAssignments =
      findRuleAssignmentsForProduct(product);

    return productEditMapper.toEditResponse(product, ruleAssignments);
  }

  private List<RestaurantRuleAssignment> findRuleAssignmentsForProduct(
    Product product
  ) {
    if (
      product.getId() == null
        || product.getRestaurant() == null
        || product.getRestaurant().getId() == null
    ) {
      return List.of();
    }

    return ruleAssignmentRepository.findAssignmentsForProductEdit(
      product.getRestaurant().getId(),
      product.getId()
    );
  }
}
