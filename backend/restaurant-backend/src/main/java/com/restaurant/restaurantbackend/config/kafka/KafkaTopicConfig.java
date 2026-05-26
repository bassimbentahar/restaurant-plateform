package com.restaurant.restaurantbackend.config.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

  public static final String ORDER_CREATED_TOPIC = "order-created-events";
  public static final String ORDER_STATUS_CHANGED_TOPIC = "order-status-changed-events";

  @Bean
  public NewTopic orderCreatedTopic() {
    return new NewTopic(ORDER_CREATED_TOPIC, 1, (short) 1);
  }

  @Bean
  public NewTopic orderStatusChangedTopic() {
    return new NewTopic(ORDER_STATUS_CHANGED_TOPIC, 1, (short) 1);
  }


}
