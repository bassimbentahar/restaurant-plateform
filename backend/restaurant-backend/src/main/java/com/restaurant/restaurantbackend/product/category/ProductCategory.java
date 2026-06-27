package com.restaurant.restaurantbackend.product.category;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(
  name = "categories",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_categories_restaurant_slug",
      columnNames = {"restaurant_id", "slug"}
    ),
    @UniqueConstraint(
      name = "uk_categories_restaurant_name",
      columnNames = {"restaurant_id", "name"}
    )
  }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategory extends BaseEntity {

  @Column(nullable = false, length = 120)
  private String name;

  @Column(nullable = false, length = 120)
  private String slug;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;
}
