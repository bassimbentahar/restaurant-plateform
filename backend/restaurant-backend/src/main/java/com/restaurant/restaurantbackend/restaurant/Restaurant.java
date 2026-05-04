package com.restaurant.restaurantbackend.restaurant;

import com.restaurant.restaurantbackend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
  name = "restaurants",
  indexes = {
    @Index(name = "idx_restaurant_slug", columnList = "slug"),
    @Index(name = "idx_restaurant_city", columnList = "city")
  }
)
public class Restaurant extends BaseEntity {

  @Column(nullable = false, length = 150)
  private String name;

  @Column(nullable = false, unique = true, length = 150)
  private String slug;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(length = 50)
  private String phone;

  @Column(length = 255)
  private String email;

  private String street;

  @Column(name = "street_number")
  private String streetNumber;

  @Column(name = "postal_code", length = 20)
  private String postalCode;

  @Column(length = 120)
  private String city;

  @Builder.Default
  @Column(length = 120)
  private String country = "Switzerland";

  // 🔥 IMPORTANT pour livraison
  @Column(precision = 10, scale = 7)
  private BigDecimal latitude;

  @Column(precision = 10, scale = 7)
  private BigDecimal longitude;

  // 🔥 Flags business
  @Builder.Default
  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @Builder.Default
  @Column(name = "is_open", nullable = false)
  private boolean open = true;

  // 🔥 BONUS PRO (très utile)
  @Builder.Default
  @Column(name = "supports_delivery", nullable = false)
  private boolean supportsDelivery = true;

  @Builder.Default
  @Column(name = "supports_pickup", nullable = false)
  private boolean supportsPickup = true;

  // 🔥 UX / performance
  @Builder.Default
  @Column(name = "average_rating", precision = 2, scale = 1)
  private BigDecimal averageRating = BigDecimal.ZERO;

  @Builder.Default
  @Column(name = "total_reviews")
  private int totalReviews = 0;
}
