package com.restaurant.restaurantbackend.restaurant.fulfillment;

import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.restaurant.RestaurantRepository;
import com.restaurant.restaurantbackend.restaurant.fulfillment.dto.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantFulfillmentSettingsService {

  private final RestaurantFulfillmentSettingsRepository repository;
  private final RestaurantRepository restaurantRepository;

  @Transactional(readOnly = true)
  public RestaurantFulfillmentSettingsResponse get(UUID restaurantId) {
    return repository.findByRestaurantId(restaurantId)
      .map(this::toResponse)
      .orElseThrow(() -> new EntityNotFoundException("Fulfillment settings not found"));
  }

  @Transactional
  public RestaurantFulfillmentSettingsResponse upsert(
    UUID restaurantId,
    RestaurantFulfillmentSettingsRequest request
  ) {
    Restaurant restaurant = restaurantRepository.findById(restaurantId)
      .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

    com.restaurant.restaurantbackend.restaurant.fulfillment.RestaurantFulfillmentSettings settings = repository.findByRestaurantId(restaurantId)
      .orElseGet(() -> com.restaurant.restaurantbackend.restaurant.fulfillment.RestaurantFulfillmentSettings.builder()
        .restaurant(restaurant)
        .build());

    if (request.deliveryEnabled() != null) settings.setDeliveryEnabled(request.deliveryEnabled());
    if (request.pickupEnabled() != null) settings.setPickupEnabled(request.pickupEnabled());
    if (request.preparationMinutes() != null) settings.setPreparationMinutes(request.preparationMinutes());
    if (request.deliveryMinutes() != null) settings.setDeliveryMinutes(request.deliveryMinutes());
    if (request.slotIntervalMinutes() != null) settings.setSlotIntervalMinutes(request.slotIntervalMinutes());
    if (request.maxOrdersPerSlot() != null) settings.setMaxOrdersPerSlot(request.maxOrdersPerSlot());
    if (request.asapEnabled() != null) settings.setAsapEnabled(request.asapEnabled());
    if (request.scheduledEnabled() != null) settings.setScheduledEnabled(request.scheduledEnabled());
    if (request.daysAhead() != null) settings.setDaysAhead(request.daysAhead());

    return toResponse(repository.save(settings));
  }

  private RestaurantFulfillmentSettingsResponse toResponse(com.restaurant.restaurantbackend.restaurant.fulfillment.RestaurantFulfillmentSettings s) {
    return new RestaurantFulfillmentSettingsResponse(
      s.getId(),
      s.getRestaurant().getId(),
      s.isDeliveryEnabled(),
      s.isPickupEnabled(),
      s.getPreparationMinutes(),
      s.getDeliveryMinutes(),
      s.getSlotIntervalMinutes(),
      s.getMaxOrdersPerSlot(),
      s.isAsapEnabled(),
      s.isScheduledEnabled(),
      s.getDaysAhead()
    );
  }
}
