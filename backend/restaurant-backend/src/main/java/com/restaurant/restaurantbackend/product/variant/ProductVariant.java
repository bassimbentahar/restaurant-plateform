package com.restaurant.restaurantbackend.product.variant;

import com.restaurant.restaurantbackend.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;


@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "product_variants")
public class ProductVariant {

  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(length = 100)
  private String sku;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal priceAdjustment = BigDecimal.ZERO;

  @Column(nullable = false)
  private boolean isDefault = false;

  @Column(nullable = false)
  private boolean isAvailable = true;

  @Column(nullable = false)
  private Integer displayOrder = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

}
