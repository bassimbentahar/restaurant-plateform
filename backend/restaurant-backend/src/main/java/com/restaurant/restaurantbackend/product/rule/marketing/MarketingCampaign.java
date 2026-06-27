package com.restaurant.restaurantbackend.product.rule.marketing;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MarketingCampaign extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(columnDefinition = "text")
  private String description;

  @Column(name = "starts_at")
  private LocalDateTime startsAt;

  @Column(name = "ends_at")
  private LocalDateTime endsAt;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @Column(name = "customer_visible", nullable = false)
  private boolean customerVisible = true;

  @Column(name = "customer_title", length = 120)
  private String customerTitle;

  @Column(name = "customer_description", columnDefinition = "text")
  private String customerDescription;
}
