package com.restaurant.restaurantbackend.order;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.user.User;
import com.restaurant.restaurantbackend.user.UserAddress;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "address_id")
  private UserAddress address;

  @Column(name = "order_number", nullable = false, unique = true)
  private String orderNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "order_type", nullable = false)
  private OrderType orderType;

  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OrderStatus status = OrderStatus.PENDING;

  @Enumerated(EnumType.STRING)
  @Column(name = "delivery_time_type", nullable = false)
  private DeliveryTimeType deliveryTimeType;

  @Column(name = "scheduled_date")
  private LocalDate scheduledDate;

  @Column(name = "scheduled_time")
  private LocalTime scheduledTime;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal subtotal;

  @Column(name = "service_fee", nullable = false, precision = 10, scale = 2)
  private BigDecimal serviceFee;

  @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
  private BigDecimal deliveryFee;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal total;

  @Column(name = "customer_firstname", nullable = false)
  private String customerFirstname;

  @Column(name = "customer_lastname", nullable = false)
  private String customerLastname;

  @Column(name = "customer_phone", nullable = false)
  private String customerPhone;

  @Column(columnDefinition = "TEXT")
  private String note;

  @Builder.Default
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> items = new ArrayList<>();

  public void addItem(OrderItem item) {
    items.add(item);
    item.setOrder(this);
  }
}
