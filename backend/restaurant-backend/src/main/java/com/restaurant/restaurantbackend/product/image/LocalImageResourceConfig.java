package com.restaurant.restaurantbackend.product.image;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.images.storage", havingValue = "local")
public class LocalImageResourceConfig implements WebMvcConfigurer {

  private final ProductImageStorageProperties properties;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    Path rootPath = Path.of(properties.local().rootPath())
      .toAbsolutePath()
      .normalize();

    registry
      .addResourceHandler("/media/**")
      .addResourceLocations(rootPath.toUri().toString());
  }
}
