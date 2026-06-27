package com.restaurant.restaurantbackend.product.category.productCategoryLink;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.category.ProductCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
  name = "product_categories",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_product_category_unique",
      columnNames = {"product_id", "category_id"}
    )
  }
)
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryLink extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private ProductCategory category;

  private Integer displayOrder = 0;

}
