package com.restaurant.restaurantbackend.product.variant;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Getter
@Setter
@Entity
@Table(
  name = "variant_option_groups",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_variant_option_groups_variant_group",
      columnNames = {"variant_id", "option_group_id"}
    )
  }
)
public class VariantOptionGroup extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "variant_id", nullable = false)
  private ProductVariant variant;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "option_group_id", nullable = false)
  private OptionGroup optionGroup;

  @Column(name = "required_override")
  private Boolean requiredOverride;

  @Column(name = "min_select_override")
  private Integer minSelectOverride;

  @Column(name = "max_select_override")
  private Integer maxSelectOverride;

  @Column(name = "included_selections_override")
  private Integer includedSelectionsOverride;

  @Column(name = "display_order", nullable = false)
  private Integer displayOrder;
}
