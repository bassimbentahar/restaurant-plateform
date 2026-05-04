package com.restaurant.restaurantbackend.order;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Column(name = "product_name", nullable = false)
  private String productName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "variant_id")
  private ProductVariant variant;

  @Column(name = "variant_name")
  private String variantName;

  @Column(nullable = false)
  private int quantity;

  @Column(name = "base_unit_price", nullable = false, precision = 10, scale = 2)
  private BigDecimal baseUnitPrice;

  @Column(name = "unit_final_price", nullable = false, precision = 10, scale = 2)
  private BigDecimal unitFinalPrice;

  @Column(name = "line_total_price", nullable = false, precision = 10, scale = 2)
  private BigDecimal lineTotalPrice;

  @Column(name = "special_instructions", columnDefinition = "TEXT")
  private String specialInstructions;

  @Builder.Default
  @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItemOption> options = new ArrayList<>();

  public void addOption(OrderItemOption option) {
    options.add(option);
    option.setOrderItem(this);
  }
}
