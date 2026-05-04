package com.restaurant.restaurantbackend.restaurant;

import com.restaurant.restaurantbackend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restaurant_opening_hours")
public class RestaurantOpeningHour extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  /**
   * 1 = lundi, 7 = dimanche
   */
  @Enumerated(EnumType.STRING)
  @Column(name = "day_of_week", nullable = false)
  private DayOfWeek dayOfWeek;

  @Column(name = "open_time", nullable = false)
  private LocalTime openTime;

  @Column(name = "close_time", nullable = false)
  private LocalTime closeTime;

  @Builder.Default
  @Column(name = "delivery_enabled", nullable = false)
  private boolean deliveryEnabled = true;

  @Builder.Default
  @Column(name = "pickup_enabled", nullable = false)
  private boolean pickupEnabled = true;

  @Builder.Default
  @Column(nullable = false)
  private boolean closed = false;
}
