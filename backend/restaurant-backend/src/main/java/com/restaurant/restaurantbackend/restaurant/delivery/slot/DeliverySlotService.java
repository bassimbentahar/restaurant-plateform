package com.restaurant.restaurantbackend.restaurant.delivery.slot;

import com.restaurant.restaurantbackend.restaurant.RestaurantOpeningHour;
import com.restaurant.restaurantbackend.restaurant.RestaurantOpeningHourRepository;
import com.restaurant.restaurantbackend.restaurant.delivery.slot.dto.DeliverySlotDayResponse;
import com.restaurant.restaurantbackend.restaurant.delivery.slot.dto.DeliverySlotResponse;
import com.restaurant.restaurantbackend.restaurant.fulfillment.FulfillmentType;
import com.restaurant.restaurantbackend.restaurant.fulfillment.RestaurantFulfillmentSettings;
import com.restaurant.restaurantbackend.restaurant.fulfillment.RestaurantFulfillmentSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DeliverySlotService {

  private final RestaurantOpeningHourRepository openingHourRepository;
  private final RestaurantFulfillmentSettingsRepository settingsRepository;

  public List<DeliverySlotDayResponse> getSlots(UUID restaurantId, FulfillmentType type, Locale locale) {
    if (locale == null) {
      locale = Locale.FRENCH;
    }

    RestaurantFulfillmentSettings settings = settingsRepository
      .findByRestaurantId(restaurantId)
      .orElseThrow(() -> new IllegalStateException("Fulfillment settings not found"));

    List<RestaurantOpeningHour> openingHours =
      openingHourRepository.findByRestaurantId(restaurantId);

    List<DeliverySlotDayResponse> result = new ArrayList<>();

    LocalDate today = LocalDate.now();
    LocalTime now = LocalTime.now();

    for (int i = 0; i < settings.getDaysAhead(); i++) {
      LocalDate date = today.plusDays(i);
      DayOfWeek dayOfWeek = date.getDayOfWeek();

      List<RestaurantOpeningHour> dayOpenings = openingHours.stream()
        .filter(h -> h.getDayOfWeek() == dayOfWeek)
        .sorted(Comparator.comparing(RestaurantOpeningHour::getOpenTime))
        .toList();

      if (dayOpenings.isEmpty()) {
        result.add(new DeliverySlotDayResponse(
          date.toString(),
          formatDayLabel(date, locale),
          true,
          List.of()
        ));
        continue;
      }

      int finalI = i;
      List<DeliverySlotResponse> slots = dayOpenings.stream()
        .filter(opening -> !opening.isClosed())
        .filter(opening -> type != FulfillmentType.DELIVERY || opening.isDeliveryEnabled())
        .filter(opening -> type != FulfillmentType.PICKUP || opening.isPickupEnabled())
        .flatMap(opening -> generateSlots(
          opening,
          settings,
          type,
          now,
          finalI == 0
        ).stream())
        .sorted(Comparator.comparing(DeliverySlotResponse::time))
        .toList();

      boolean dayDisabled = slots.isEmpty() || slots.stream().allMatch(DeliverySlotResponse::disabled);

      result.add(new DeliverySlotDayResponse(
        date.toString(),
        formatDayLabel(date, locale),
        dayDisabled,
        slots
      ));
    }

    return result;
  }

  private List<DeliverySlotResponse> generateSlots(
    RestaurantOpeningHour opening,
    RestaurantFulfillmentSettings settings,
    FulfillmentType type,
    LocalTime now,
    boolean isToday
  ) {
    List<DeliverySlotResponse> slots = new ArrayList<>();

    LocalTime start = opening.getOpenTime();
    LocalTime end = opening.getCloseTime();

    int interval = settings.getSlotIntervalMinutes();
    int preparationMinutes = settings.getPreparationMinutes();

    int extraMinutes = type == FulfillmentType.DELIVERY
      ? settings.getDeliveryMinutes()
      : 0;

    LocalTime minimumAvailableTime = now
      .plusMinutes(preparationMinutes)
      .plusMinutes(extraMinutes);

    LocalTime current = start;

    while (!current.isAfter(end.minusMinutes(interval))) {
      boolean disabled = false;
      String reason = null;

      if (isToday && current.isBefore(minimumAvailableTime)) {
        disabled = true;
        reason = type == FulfillmentType.DELIVERY
          ? "Temps de préparation et livraison insuffisant"
          : "Temps de préparation insuffisant";
      }

      slots.add(new DeliverySlotResponse(
        current.toString(),
        current.format(DateTimeFormatter.ofPattern("HH:mm")),
        disabled,
        reason
      ));

      current = current.plusMinutes(interval);
    }

    return slots;
  }

  private String formatDayLabel(LocalDate date, Locale locale) {
    LocalDate today = LocalDate.now();

    if (date.equals(today)) {
      return switch (locale.getLanguage()) {
        case "fr" -> "Aujourd’hui";
        case "en" -> "Today";
        default -> "Today";
      };
    }

    if (date.equals(today.plusDays(1))) {
      return switch (locale.getLanguage()) {
        case "fr" -> "Demain";
        case "en" -> "Tomorrow";
        default -> "Tomorrow";
      };
    }

    return date.getDayOfWeek()
      .getDisplayName(TextStyle.FULL, locale);
  }
}
