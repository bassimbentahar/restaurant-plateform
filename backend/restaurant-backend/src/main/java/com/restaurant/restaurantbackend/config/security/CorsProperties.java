package com.restaurant.restaurantbackend.config.security;

import org.jspecify.annotations.Nullable;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {
  private List<String> allowedOrigins;

  public @Nullable List<String> getAllowedOrigins() {
    return allowedOrigins;
  }
}
