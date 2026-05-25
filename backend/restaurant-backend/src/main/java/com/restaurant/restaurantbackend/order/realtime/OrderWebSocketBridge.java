package com.restaurant.restaurantbackend.order.realtime;

import com.restaurant.restaurantbackend.config.kafka.KafkaTopicConfig;
import com.restaurant.restaurantbackend.order.event.OrderCreatedEvent;
import com.restaurant.restaurantbackend.order.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderWebSocketBridge {

  private final SimpMessagingTemplate messagingTemplate;

  @KafkaListener(
    topics = KafkaTopicConfig.ORDER_CREATED_TOPIC,
    groupId = "websocket-bridge"
  )
  public void handleOrderCreated(OrderCreatedEvent event) {
    messagingTemplate.convertAndSend(
      "/topic/restaurants/" + event.restaurantId() + "/orders",
      event
    );

    messagingTemplate.convertAndSend(
      "/topic/users/" + event.userId() + "/orders",
      event
    );
  }

  @KafkaListener(
    topics = KafkaTopicConfig.ORDER_STATUS_CHANGED_TOPIC,
    groupId = "websocket-bridge"
  )
  public void handleStatusChanged(OrderStatusChangedEvent event) {
    messagingTemplate.convertAndSend(
      "/topic/orders/" + event.orderId(),
      event
    );

    messagingTemplate.convertAndSend(
      "/topic/users/" + event.userId() + "/orders",
      event
    );

    messagingTemplate.convertAndSend(
      "/topic/restaurants/" + event.restaurantId() + "/orders",
      event
    );
  }
}
