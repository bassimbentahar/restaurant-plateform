package com.restaurant.restaurantbackend.restaurant.fulfillment;

import com.restaurant.restaurantbackend.restaurant.fulfillment.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/fulfillment-settings")
@RequiredArgsConstructor
public class RestaurantFulfillmentSettingsController {

  private final RestaurantFulfillmentSettingsService service;

  @GetMapping
  public RestaurantFulfillmentSettingsResponse get(@PathVariable UUID restaurantId) {
    return service.get(restaurantId);
  }

  @PutMapping
  public RestaurantFulfillmentSettingsResponse upsert(
    @PathVariable UUID restaurantId,
    @RequestBody RestaurantFulfillmentSettingsRequest request
  ) {
    return service.upsert(restaurantId, request);
  }
}
