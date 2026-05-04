package com.restaurant.restaurantbackend.restaurant.delivery.zone;

import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.restaurant.RestaurantRepository;
import com.restaurant.restaurantbackend.restaurant.delivery.zone.dto.DeliveryValidationResponse;
import com.restaurant.restaurantbackend.restaurant.delivery.zone.dto.DeliveryZoneRequest;
import com.restaurant.restaurantbackend.restaurant.delivery.zone.dto.DeliveryZoneResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.WKTWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeliveryZoneService {

  private final DeliveryZoneRepository deliveryZoneRepository;
  private final RestaurantRepository restaurantRepository;

  private final WKTReader wktReader = new WKTReader();
  private final WKTWriter wktWriter = new WKTWriter();

  @Transactional(readOnly = true)
  public List<DeliveryZoneResponse> findByRestaurant(UUID restaurantId) {
    return deliveryZoneRepository.findByRestaurantIdOrderByNameAsc(restaurantId)
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional
  public DeliveryZoneResponse create(UUID restaurantId, DeliveryZoneRequest request) {
    Restaurant restaurant = getRestaurant(restaurantId);

    DeliveryZone zone = DeliveryZone.builder()
      .restaurant(restaurant)
      .name(request.name())
      .deliveryFee(request.deliveryFee())
      .minOrderAmount(request.minOrderAmount())
      .enabled(request.enabled() == null || request.enabled())
      .area(toPolygon(request.polygonWkt()))
      .build();

    return toResponse(deliveryZoneRepository.save(zone));
  }

  @Transactional
  public DeliveryZoneResponse update(UUID restaurantId, UUID zoneId, DeliveryZoneRequest request) {
    DeliveryZone zone = getZone(zoneId);

    if (!zone.getRestaurant().getId().equals(restaurantId)) {
      throw new IllegalArgumentException("Delivery zone does not belong to this restaurant");
    }

    zone.setName(request.name());
    zone.setDeliveryFee(request.deliveryFee());
    zone.setMinOrderAmount(request.minOrderAmount());
    zone.setEnabled(request.enabled() == null || request.enabled());
    zone.setArea(toPolygon(request.polygonWkt()));

    return toResponse(zone);
  }

  @Transactional
  public void delete(UUID restaurantId, UUID zoneId) {
    DeliveryZone zone = getZone(zoneId);

    if (!zone.getRestaurant().getId().equals(restaurantId)) {
      throw new IllegalArgumentException("Delivery zone does not belong to this restaurant");
    }

    deliveryZoneRepository.delete(zone);
  }

  private Restaurant getRestaurant(UUID id) {
    return restaurantRepository.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
  }

  private DeliveryZone getZone(UUID id) {
    return deliveryZoneRepository.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Delivery zone not found"));
  }

  private Polygon toPolygon(String wkt) {
    try {
      Geometry geometry = wktReader.read(wkt);
      geometry.setSRID(4326);

      if (!(geometry instanceof Polygon polygon)) {
        throw new IllegalArgumentException("Geometry must be a Polygon");
      }

      return polygon;
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid polygon WKT", e);
    }
  }

  private DeliveryZoneResponse toResponse(DeliveryZone zone) {
    return new DeliveryZoneResponse(
      zone.getId(),
      zone.getRestaurant().getId(),
      zone.getName(),
      zone.getDeliveryFee(),
      zone.getMinOrderAmount(),
      zone.isEnabled(),
      wktWriter.write(zone.getArea())
    );
  }

  public DeliveryValidationResponse validateAddress(UUID restaurantId, double lat, double lng) {
    return deliveryZoneRepository.findZoneContainingPoint(restaurantId, lat, lng)
      .map(zone -> new DeliveryValidationResponse(
        true,
        zone.getDeliveryFee(),
        zone.getMinOrderAmount(),
        zone.getName(),
        null
      ))
      .orElseGet(() -> new DeliveryValidationResponse(
        false,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        null,
        "Cette adresse est hors zone de livraison."
      ));
  }}
