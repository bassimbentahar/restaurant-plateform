package com.restaurant.restaurantbackend.restaurant.delivery.zone;

import com.restaurant.restaurantbackend.restaurant.delivery.zone.dto.DeliveryValidationResponse;
import com.restaurant.restaurantbackend.restaurant.delivery.zone.dto.DeliveryZoneRequest;
import com.restaurant.restaurantbackend.restaurant.delivery.zone.dto.DeliveryZoneResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/delivery-zones")
@RequiredArgsConstructor
public class DeliveryZoneController {

  private final DeliveryZoneService deliveryZoneService;

  @GetMapping
  public List<DeliveryZoneResponse> findAll(@PathVariable UUID restaurantId) {
    return deliveryZoneService.findByRestaurant(restaurantId);
  }

  @PostMapping
  public DeliveryZoneResponse create(
    @PathVariable UUID restaurantId,
    @Valid @RequestBody DeliveryZoneRequest request
  ) {
    return deliveryZoneService.create(restaurantId, request);
  }

  @PutMapping("/{zoneId}")
  public DeliveryZoneResponse update(
    @PathVariable UUID restaurantId,
    @PathVariable UUID zoneId,
    @Valid @RequestBody DeliveryZoneRequest request
  ) {
    return deliveryZoneService.update(restaurantId, zoneId, request);
  }

  @DeleteMapping("/{zoneId}")
  public void delete(
    @PathVariable UUID restaurantId,
    @PathVariable UUID zoneId
  ) {
    deliveryZoneService.delete(restaurantId, zoneId);
  }

  @GetMapping("/validate")
  public DeliveryValidationResponse validateAddress(
    @PathVariable UUID restaurantId,
    @RequestParam double lat,
    @RequestParam double lng
  ) {
    return deliveryZoneService.validateAddress(restaurantId, lat, lng);
  }
}
