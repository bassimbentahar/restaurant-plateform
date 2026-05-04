package com.restaurant.restaurantbackend.restaurant.delivery.zone;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.locationtech.jts.geom.Polygon;

import java.math.BigDecimal;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "delivery_zones")
public class DeliveryZone extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
  private BigDecimal deliveryFee;

  @Column(name = "min_order_amount", nullable = false, precision = 10, scale = 2)
  private BigDecimal minOrderAmount;

  @Builder.Default
  @Column(nullable = false)
  private boolean enabled = true;

  @Column(
    name = "area",
    nullable = false,
    columnDefinition = "geometry(Polygon,4326)"
  )
  private Polygon area;
}
