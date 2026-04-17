package com.restaurant.restaurantbackend.product.category;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "categories")
public class ProductCategory {

  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, unique = true, length = 120)
  private String name;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;
}
