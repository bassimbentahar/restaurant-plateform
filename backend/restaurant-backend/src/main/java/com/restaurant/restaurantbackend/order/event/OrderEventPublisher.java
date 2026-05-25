package com.restaurant.restaurantbackend.order.event;

import com.restaurant.restaurantbackend.config.kafka.KafkaTopicConfig;
import com.restaurant.restaurantbackend.order.Order;
import com.restaurant.restaurantbackend.order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

  private final KafkaTemplate<String, String> kafkaTemplate;
  private final ObjectMapper objectMapper;

  public void publishOrderCreated(Order order) {
    try {
      var event = new OrderCreatedEvent(
        order.getId(),
        order.getRestaurant().getId(),
        order.getUser().getId(),
        order.getOrderNumber(),
        order.getTotal(),
        Instant.now()
      );

      String payload = objectMapper.writeValueAsString(event);

      kafkaTemplate.send(
        KafkaTopicConfig.ORDER_CREATED_TOPIC,
        order.getId().toString(),
        payload
      );

    } catch (Exception e) {
      throw new RuntimeException("Kafka serialization error", e);
    }
  }

  public void publishOrderStatusChanged(
    Order order,
    OrderStatus oldStatus,
    OrderStatus newStatus
  ) {
    var event = new OrderStatusChangedEvent(
      order.getId(),
      order.getRestaurant().getId(),
      order.getUser().getId(),
      order.getOrderNumber(),
      oldStatus.name(),
      newStatus.name(),
      Instant.now()
    );

    String payload = objectMapper.writeValueAsString(event);

    kafkaTemplate.send(
      KafkaTopicConfig.ORDER_STATUS_CHANGED_TOPIC,
      order.getId().toString(),
      payload
    );
  }
}
