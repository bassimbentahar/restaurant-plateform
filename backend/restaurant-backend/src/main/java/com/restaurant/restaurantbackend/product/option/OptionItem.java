package com.restaurant.restaurantbackend.product.option;

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
@Table(name = "option_items")
public class OptionItem {

  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(length = 255)
  private String description;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal priceAdjustment = BigDecimal.ZERO;

  @Column(nullable = false)
  private boolean isDefault = false;

  @Column(nullable = false)
  private boolean isAvailable = true;

  @Column(nullable = false)
  private Integer displayOrder = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "option_group_id", nullable = false)
  private OptionGroup optionGroup;
}
