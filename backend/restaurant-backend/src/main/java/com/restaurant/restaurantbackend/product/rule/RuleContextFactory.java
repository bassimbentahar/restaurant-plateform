package com.restaurant.restaurantbackend.product.rule;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Component
public class RuleContextFactory {

  public RuleContext build(
    Product product,
    ProductVariant variant,
    UUID optionGroupId
  ) {
    return new RuleContext(
      product.getId(),
      variant.getId(),
      optionGroupId,
      variant.getName(),
      null,
      LocalTime.now(),
      LocalDate.now().getDayOfWeek(),
      List.of()
    );
  }
}
