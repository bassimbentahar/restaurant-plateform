package com.restaurant.restaurantbackend.product.option.item;

import com.restaurant.restaurantbackend.product.option.ProductOptionGroupLink;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
  name = "product_option_item_overrides",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_product_option_item_override",
      columnNames = {"product_option_group_link_id", "option_item_id"}
    )
  }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductOptionItemOverride {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "product_option_group_link_id", nullable = false)
  private ProductOptionGroupLink productOptionGroupLink;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "option_item_id", nullable = false)
  private OptionItem optionItem;

  @Column(nullable = false)
  private boolean visible = true;
}
