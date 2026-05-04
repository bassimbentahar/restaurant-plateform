package com.restaurant.restaurantbackend.restaurant.delivery.slot;

import com.restaurant.restaurantbackend.restaurant.delivery.slot.dto.DeliverySlotDayResponse;
import com.restaurant.restaurantbackend.restaurant.fulfillment.FulfillmentType;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/delivery-slots")
@RequiredArgsConstructor
public class DeliverySlotController {

  private final DeliverySlotService deliverySlotService;

  @GetMapping
  public List<DeliverySlotDayResponse> getSlots(
    @PathVariable UUID restaurantId,
    @RequestParam FulfillmentType type,
    Locale locale
  ) {
    return deliverySlotService.getSlots(restaurantId, type, locale);
  }
}
