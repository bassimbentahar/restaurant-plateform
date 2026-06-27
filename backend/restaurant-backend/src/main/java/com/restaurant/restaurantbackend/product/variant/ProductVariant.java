package com.restaurant.restaurantbackend.product.variant;

import com.restaurant.restaurantbackend.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
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

  @Column(name = "compare_at_price", precision = 10, scale = 2)
  private BigDecimal compareAtPrice;

  //TODO promotionStartAt
  //TODO promotionEndAt
  @Column(nullable = false)
  private boolean isDefault = false;

  @Column(nullable = false)
  private boolean isAvailable = true;

  @Column(nullable = false)
  private Integer displayOrder = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;


  @OneToMany(
    mappedBy = "variant",
    cascade = CascadeType.ALL,
    orphanRemoval = true
  )
  @OrderBy("displayOrder ASC")
  private List<VariantOptionGroup> optionGroups;

  public BigDecimal calculateFinalPrice() {
    BigDecimal basePrice = product != null && product.getBasePrice() != null
      ? product.getBasePrice()
      : BigDecimal.ZERO;

    BigDecimal adjustment = priceAdjustment != null
      ? priceAdjustment
      : BigDecimal.ZERO;

    return basePrice.add(adjustment);
  }
}
