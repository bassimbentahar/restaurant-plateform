package com.restaurant.restaurantbackend.restaurant.hours;

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
  name = "restaurant_exception_hours",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_exception_restaurant_date",
      columnNames = {"restaurant_id", "exception_date"}
    )
  }
)
public class RestaurantExceptionHour extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @Column(name = "exception_date", nullable = false)
  private LocalDate exceptionDate;

  @Column(name = "open_time")
  private LocalTime openTime;

  @Column(name = "close_time")
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

  private String reason;
}
