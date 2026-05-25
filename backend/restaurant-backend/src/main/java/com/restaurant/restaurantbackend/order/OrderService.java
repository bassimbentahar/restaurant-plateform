package com.restaurant.restaurantbackend.order;

import com.restaurant.restaurantbackend.order.dto.*;
import com.restaurant.restaurantbackend.order.event.OrderEventPublisher;
import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.ProductRepository;
import com.restaurant.restaurantbackend.product.option.OptionItem;
import com.restaurant.restaurantbackend.product.option.OptionItemRepository;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.product.variant.ProductVariantRepository;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.restaurant.RestaurantRepository;
import com.restaurant.restaurantbackend.user.CurrentUserService;
import com.restaurant.restaurantbackend.user.User;
import com.restaurant.restaurantbackend.user.UserAddress;
import com.restaurant.restaurantbackend.user.UserAddressRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

  private static final BigDecimal SERVICE_FEE_RATE = new BigDecimal("0.06");

  private final OrderRepository orderRepository;
  private final RestaurantRepository restaurantRepository;
  private final ProductRepository productRepository;
  private final ProductVariantRepository variantRepository;
  private final OptionItemRepository optionItemRepository;
  private final UserAddressRepository addressRepository;
  private final CurrentUserService userService;
  private final OrderMapper orderMapper;
  private final OrderEventPublisher orderEventPublisher;

  @Transactional
  public OrderResponse createOrder(CreateOrderRequest request) {
    User user = userService.getOrCreateCurrentUser();

    Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
      .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

    UserAddress address = resolveAddress(request, user);

    validateScheduledOrder(request);

    Order order = Order.builder()
      .restaurant(restaurant)
      .user(user)
      .address(address)
      .orderNumber(generateOrderNumber())
      .orderType(request.orderType())
      .status(OrderStatus.PENDING)
      .deliveryTimeType(request.deliveryTimeType())
      .scheduledDate(request.scheduledDate())
      .scheduledTime(request.scheduledTime())
      .customerFirstname(request.customerFirstname())
      .customerLastname(request.customerLastname())
      .customerPhone(request.customerPhone())
      .note(request.note())
      .subtotal(BigDecimal.ZERO)
      .serviceFee(BigDecimal.ZERO)
      .deliveryFee(BigDecimal.ZERO)
      .total(BigDecimal.ZERO)
      .build();

    BigDecimal subtotal = BigDecimal.ZERO;

    for (CreateOrderItemRequest itemRequest : request.items()) {
      OrderItem orderItem = buildOrderItem(itemRequest, restaurant);
      order.addItem(orderItem);
      subtotal = subtotal.add(orderItem.getLineTotalPrice());
    }

    BigDecimal serviceFee = subtotal
      .multiply(SERVICE_FEE_RATE)
      .setScale(2, RoundingMode.HALF_UP);

    BigDecimal deliveryFee = request.orderType() == OrderType.DELIVERY
      ? new BigDecimal("4.50")
      : BigDecimal.ZERO;

    BigDecimal total = subtotal.add(serviceFee).add(deliveryFee);

    order.setSubtotal(subtotal);
    order.setServiceFee(serviceFee);
    order.setDeliveryFee(deliveryFee);
    order.setTotal(total);

    Order saved = orderRepository.save(order);

    orderEventPublisher.publishOrderCreated(saved);

    return orderMapper.toResponse(saved);
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> findMyOrders() {
    User user = userService.getOrCreateCurrentUser();

    return orderRepository.findByUserIdOrderByCreatedDateDesc(user.getId())
      .stream()
      .map(orderMapper::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public OrderResponse findById(UUID id) {
    Order order = orderRepository.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Order not found"));

    return orderMapper.toResponse(order);
  }

  @Transactional
  public OrderResponse updateStatus(UUID orderId, OrderStatus newStatus) {
    Order order = orderRepository.findById(orderId)
      .orElseThrow(() -> new EntityNotFoundException("Order not found"));

    OrderStatus oldStatus = order.getStatus();

    if (oldStatus == newStatus) {
      return orderMapper.toResponse(order);
    }

    validateStatusTransition(oldStatus, newStatus);

    order.setStatus(newStatus);

    Order saved = orderRepository.save(order);

    orderEventPublisher.publishOrderStatusChanged(saved, oldStatus, newStatus);

    return orderMapper.toResponse(saved);
  }

  private UserAddress resolveAddress(CreateOrderRequest request, User user) {
    if (request.orderType() == OrderType.PICKUP) {
      return null;
    }

    if (request.addressId() == null) {
      throw new IllegalArgumentException("Address is required for delivery");
    }

    return addressRepository.findByIdAndUserId(request.addressId(), user.getId())
      .orElseThrow(() -> new EntityNotFoundException("Address not found"));
  }

  private void validateScheduledOrder(CreateOrderRequest request) {
    if (request.deliveryTimeType() == DeliveryTimeType.SCHEDULED) {
      if (request.scheduledDate() == null || request.scheduledTime() == null) {
        throw new IllegalArgumentException("Scheduled date and time are required");
      }
    }
  }

  private OrderItem buildOrderItem(CreateOrderItemRequest itemRequest, Restaurant restaurant) {
    Product product = productRepository
      .findByIdAndRestaurantId(itemRequest.productId(), restaurant.getId())
      .orElseThrow(() -> new EntityNotFoundException("Product not found"));

    if (!product.isAvailable() || product.isArchived()) {
      throw new IllegalStateException("Product unavailable: " + product.getTitle());
    }

    ProductVariant variant = null;
    BigDecimal baseUnitPrice = product.getBasePrice();

    if (itemRequest.variantId() != null) {
      variant = variantRepository
        .findByIdAndProductId(itemRequest.variantId(), product.getId())
        .orElseThrow(() -> new EntityNotFoundException("Variant not found"));

      if (!variant.isAvailable()) {
        throw new IllegalStateException("Variant unavailable: " + variant.getName());
      }

      baseUnitPrice = product.getBasePrice().add(variant.getPriceAdjustment());
    }

    List<OptionItem> optionItems = itemRequest.optionItemIds() == null
      ? List.of()
      : optionItemRepository.findAllByIdIn(itemRequest.optionItemIds());

    BigDecimal optionsTotal = optionItems.stream()
      .map(OptionItem::getPriceAdjustment)
      .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal unitFinalPrice = baseUnitPrice.add(optionsTotal);

    BigDecimal lineTotalPrice = unitFinalPrice
      .multiply(BigDecimal.valueOf(itemRequest.quantity()))
      .setScale(2, RoundingMode.HALF_UP);

    OrderItem orderItem = OrderItem.builder()
      .product(product)
      .productName(product.getTitle())
      .variant(variant)
      .variantName(variant != null ? variant.getName() : null)
      .quantity(itemRequest.quantity())
      .baseUnitPrice(baseUnitPrice)
      .unitFinalPrice(unitFinalPrice)
      .lineTotalPrice(lineTotalPrice)
      .specialInstructions(itemRequest.specialInstructions())
      .build();

    for (OptionItem optionItem : optionItems) {
      OrderItemOption option = OrderItemOption.builder()
        .optionGroup(optionItem.getOptionGroup())
        .optionGroupName(optionItem.getOptionGroup().getName())
        .optionItem(optionItem)
        .optionName(optionItem.getName())
        .priceDelta(optionItem.getPriceAdjustment())
        .build();

      orderItem.addOption(option);
    }

    return orderItem;
  }

  private void validateStatusTransition(OrderStatus oldStatus, OrderStatus newStatus) {
    if (oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.DELIVERED) {
      throw new IllegalStateException("Cannot update completed or cancelled order");
    }
  }

  private String generateOrderNumber() {
    SecureRandom random = new SecureRandom();
    String number;

    do {
      number = "ORD-" + System.currentTimeMillis() + "-" + random.nextInt(1000, 9999);
    } while (orderRepository.existsByOrderNumber(number));

    return number;
  }
}
