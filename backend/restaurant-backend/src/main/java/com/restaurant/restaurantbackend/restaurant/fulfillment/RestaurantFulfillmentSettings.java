package com.restaurant.restaurantbackend.restaurant.fulfillment;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restaurant_fulfillment_settings")
public class RestaurantFulfillmentSettings extends BaseEntity {

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false, unique = true)
  private Restaurant restaurant;

  @Builder.Default
  @Column(name = "delivery_enabled", nullable = false)
  private boolean deliveryEnabled = true;

  @Builder.Default
  @Column(name = "pickup_enabled", nullable = false)
  private boolean pickupEnabled = true;

  @Builder.Default
  @Column(name = "preparation_minutes", nullable = false)
  private int preparationMinutes = 20;

  @Builder.Default
  @Column(name = "delivery_minutes", nullable = false)
  private int deliveryMinutes = 20;

  @Builder.Default
  @Column(name = "slot_interval_minutes", nullable = false)
  private int slotIntervalMinutes = 15;

  @Builder.Default
  @Column(name = "max_orders_per_slot", nullable = false)
  private int maxOrdersPerSlot = 5;

  @Builder.Default
  @Column(name = "asap_enabled", nullable = false)
  private boolean asapEnabled = true;

  @Builder.Default
  @Column(name = "scheduled_enabled", nullable = false)
  private boolean scheduledEnabled = true;

  @Builder.Default
  @Column(name = "days_ahead", nullable = false)
  private int daysAhead = 7;
}
