package com.restaurant.restaurantbackend.restaurant.fulfillment;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
  name = "restaurant_slot_overrides",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_slot_override_restaurant_date_time_type",
      columnNames = {"restaurant_id", "slot_date", "slot_time", "order_type"}
    )
  }
)
public class RestaurantSlotOverride extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @Column(name = "slot_date", nullable = false)
  private LocalDate slotDate;

  @Column(name = "slot_time", nullable = false)
  private LocalTime slotTime;

  @Enumerated(EnumType.STRING)
  @Column(name = "order_type", nullable = false)
  private FulfillmentType orderType;

  @Builder.Default
  @Column(nullable = false)
  private boolean disabled = false;

  @Column(name = "max_orders")
  private Integer maxOrders;

  private String reason;
}
