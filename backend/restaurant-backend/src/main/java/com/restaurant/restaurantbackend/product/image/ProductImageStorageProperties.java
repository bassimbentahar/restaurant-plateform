package com.restaurant.restaurantbackend.product.image;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.images")
public record ProductImageStorageProperties(
  String storage,
  String publicBaseUrl,
  String productPrefix,
  Local local,
  S3 s3
) {
  public record Local(
    String rootPath
  ) {}

  public record S3(
    String bucket,
    String region
  ) {}
}
