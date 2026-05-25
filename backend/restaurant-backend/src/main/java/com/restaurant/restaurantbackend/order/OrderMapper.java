package com.restaurant.restaurantbackend.order;

import com.restaurant.restaurantbackend.order.dto.*;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

  public OrderResponse toResponse(Order order) {
    return new OrderResponse(
      order.getId(),
      order.getOrderNumber(),
      order.getRestaurant().getId(),
      order.getUser().getId(),
      order.getAddress() != null ? order.getAddress().getId() : null,
      order.getOrderType(),
      order.getStatus(),
      order.getDeliveryTimeType(),
      order.getScheduledDate(),
      order.getScheduledTime(),
      order.getSubtotal(),
      order.getServiceFee(),
      order.getDeliveryFee(),
      order.getTotal(),
      order.getCustomerFirstname(),
      order.getCustomerLastname(),
      order.getCustomerPhone(),
      order.getNote(),
      order.getCreatedDate(),
      order.getLastModifiedDate(),
      order.getItems()
        .stream()
        .map(this::toItemResponse)
        .toList()
    );
  }

  private OrderItemResponse toItemResponse(OrderItem item) {
    return new OrderItemResponse(
      item.getId(),
      item.getProduct().getId(),
      item.getProductName(),
      item.getVariant() != null ? item.getVariant().getId() : null,
      item.getVariantName(),
      item.getQuantity(),
      item.getBaseUnitPrice(),
      item.getUnitFinalPrice(),
      item.getLineTotalPrice(),
      item.getSpecialInstructions(),
      item.getOptions()
        .stream()
        .map(this::toOptionResponse)
        .toList()
    );
  }

  private OrderItemOptionResponse toOptionResponse(OrderItemOption option) {
    return new OrderItemOptionResponse(
      option.getId(),
      option.getOptionGroup() != null ? option.getOptionGroup().getId() : null,
      option.getOptionGroupName(),
      option.getOptionItem() != null ? option.getOptionItem().getId() : null,
      option.getOptionName(),
      option.getPriceDelta()
    );
  }
}
