package com.restaurant.restaurantbackend.order;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_item_options")
public class OrderItemOption extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_item_id", nullable = false)
  private OrderItem orderItem;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "option_group_id")
  private OptionGroup optionGroup;

  @Column(name = "option_group_name", nullable = false)
  private String optionGroupName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "option_item_id")
  private OptionItem optionItem;

  @Column(name = "option_name", nullable = false)
  private String optionName;

  @Column(name = "price_delta", nullable = false, precision = 10, scale = 2)
  private BigDecimal priceDelta;
}
