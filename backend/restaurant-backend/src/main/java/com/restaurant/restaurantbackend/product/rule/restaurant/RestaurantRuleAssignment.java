package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.category.ProductCategory;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.option.item.OptionItem;
import com.restaurant.restaurantbackend.product.rule.marketing.MarketingCampaign;
import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.util.RuleTargetType;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant_rule_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RestaurantRuleAssignment extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "rule_id", nullable = false)
  private RestaurantRule rule;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "campaign_id")
  private MarketingCampaign campaign;

  @Enumerated(EnumType.STRING)
  @Column(name = "target_type", nullable = false, length = 50)
  private RuleTargetType targetType;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private ProductCategory category;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id")
  private Product product;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "variant_id")
  private ProductVariant variant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "option_group_id")
  private OptionGroup optionGroup;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "option_item_id")
  private OptionItem optionItem;

  @Column(nullable = false)
  private int priority = 0;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  private LocalDateTime startsAt;
  private LocalDateTime endsAt;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "condition_override_json", columnDefinition = "jsonb")
  private RuleCondition conditionOverride;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "action_override_json", columnDefinition = "jsonb")
  private RuleAction actionOverride;
}
