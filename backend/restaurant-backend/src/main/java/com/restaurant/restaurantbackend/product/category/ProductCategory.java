package com.restaurant.restaurantbackend.product.category;

import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Setter
@Entity
@Table(
  name = "categories",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_categories_restaurant_slug",
      columnNames = {"restaurant_id", "slug"}
    )
  }
)
public class ProductCategory {

  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, unique = true, length = 120)
  private String name;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;
}
