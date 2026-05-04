package com.restaurant.restaurantbackend.user;

import com.restaurant.restaurantbackend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddress extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private String label; // Maison, Travail

  @Column(nullable = false)
  private String street;

  private String streetNumber;

  @Column(nullable = false)
  private String postalCode;

  @Column(nullable = false)
  private String city;

  @Builder.Default
  private String country = "Switzerland";

  private String instructions;

  @Builder.Default
  private boolean defaultAddress = false;

  @Column(precision = 10, scale = 7)
  private BigDecimal latitude;

  @Column(precision = 10, scale = 7)
  private BigDecimal longitude;
}
