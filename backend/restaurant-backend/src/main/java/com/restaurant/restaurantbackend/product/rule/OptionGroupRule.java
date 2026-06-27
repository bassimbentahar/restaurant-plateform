package com.restaurant.restaurantbackend.product.rule;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.util.RuleType;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "option_group_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class OptionGroupRule extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id")
  private Product product;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "variant_id")
  private ProductVariant variant;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "option_group_id", nullable = false)
  private OptionGroup optionGroup;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private RuleType type;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "condition_json", columnDefinition = "jsonb", nullable = false)
  private Map<String, Object> conditionJson;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "action_json", columnDefinition = "jsonb", nullable = false)
  private Map<String, Object> actionJson;

  @Column(nullable = false)
  private Integer priority = 0;

  @Column(nullable = false)
  private boolean isActive = true;
}
