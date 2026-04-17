package com.restaurant.restaurantbackend.product.image;

import com.restaurant.restaurantbackend.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "product_images")
public class ProductImage {

  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, length = 500)
  private String url;

  @Column(length = 255)
  private String altText;

  @Column(nullable = false)
  private Integer displayOrder = 0;

  @Column(nullable = false)
  private boolean isPrimary = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;
}
