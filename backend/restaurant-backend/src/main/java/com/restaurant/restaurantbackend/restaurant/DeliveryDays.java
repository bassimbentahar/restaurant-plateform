package com.restaurant.restaurantbackend.restaurant;

import com.restaurant.restaurantbackend.common.BaseEntity;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeliveryDays extends BaseEntity {
  private LocalDate date;
  private boolean isClosed;
}
