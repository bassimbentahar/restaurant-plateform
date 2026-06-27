package com.restaurant.restaurantbackend.product.option;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import com.restaurant.restaurantbackend.product.option.item.ProductOptionItemOverride;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(
  name = "product_option_groups",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_product_option_groups_product_group",
      columnNames = {"product_id", "option_group_id"}
    )
  }
)
public class ProductOptionGroupLink {

  @Id
  @GeneratedValue
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "option_group_id", nullable = false)
  private OptionGroup optionGroup;

  @OneToMany(
    mappedBy = "productOptionGroupLink",
    cascade = CascadeType.ALL,
    orphanRemoval = true
  )
  @Builder.Default
  private List<ProductOptionItemOverride> itemOverrides = new ArrayList<>();

  @Column(name = "required_override")
  private Boolean requiredOverride;

  @Column(name = "min_select_override")
  private Integer minSelectOverride;

  @Column(name = "max_select_override")
  private Integer maxSelectOverride;

  @Column(name = "display_order", nullable = false)
  private Integer displayOrder = 0;

  public boolean isItemVisibleForProduct(OptionItem item) {
    return itemOverrides.stream()
      .filter(override -> override.getOptionItem().getId().equals(item.getId()))
      .findFirst()
      .map(ProductOptionItemOverride::isVisible)
      .orElse(item.isAvailable());
  }
}
