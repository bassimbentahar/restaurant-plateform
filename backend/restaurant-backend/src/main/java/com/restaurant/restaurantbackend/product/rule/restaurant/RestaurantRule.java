package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.rule.RuleAction;
import com.restaurant.restaurantbackend.product.rule.RuleCondition;
import com.restaurant.restaurantbackend.product.rule.RuleTag;
import com.restaurant.restaurantbackend.product.util.RuleType;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "restaurant_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RestaurantRule extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(columnDefinition = "text")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "rule_type", nullable = false, length = 50)
  private RuleType ruleType;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "condition_json", columnDefinition = "jsonb", nullable = false)
  private RuleCondition condition;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "action_json", columnDefinition = "jsonb", nullable = false)
  private RuleAction action;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @Column(name = "is_favorite", nullable = false)
  private boolean favorite = false;

  @Column(name = "is_reusable", nullable = false)
  private boolean reusable = true;

  @Column(name = "customer_visible", nullable = false)
  private boolean customerVisible = false;

  @Column(name = "customer_title", length = 120)
  private String customerTitle;

  @Column(name = "customer_description", columnDefinition = "text")
  private String customerDescription;

  @Column(name = "internal_only", nullable = false)
  private boolean internalOnly = false;

  @ManyToMany
  @JoinTable(
    name = "restaurant_rule_tags",
    joinColumns = @JoinColumn(name = "rule_id"),
    inverseJoinColumns = @JoinColumn(name = "tag_id")
  )
  @Builder.Default
  private Set<RuleTag> tags = new HashSet<>();
}
