package com.restaurant.restaurantbackend.restaurant;

import com.restaurant.restaurantbackend.restaurant.dto.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RestaurantService {

  private final RestaurantRepository restaurantRepository;

  @Transactional(readOnly = true)
  public List<RestaurantResponse> findAll() {
    return restaurantRepository.findAll()
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<RestaurantResponse> findActiveRestaurants() {
    return restaurantRepository.findAllByActiveTrueOrderByNameAsc()
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public RestaurantResponse findById(UUID id) {
    return restaurantRepository.findById(id)
      .map(this::toResponse)
      .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
  }

  @Transactional(readOnly = true)
  public RestaurantResponse findBySlug(String slug) {
    return restaurantRepository.findBySlug(slug)
      .map(this::toResponse)
      .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
  }

  @Transactional(readOnly = true)
  public List<NearbyRestaurantResponse> findNearby(double lat, double lng, Double radiusKm) {
    double effectiveRadiusKm = radiusKm != null ? radiusKm : 10.0;

    if (effectiveRadiusKm <= 0) {
      effectiveRadiusKm = 10.0;
    }

    double radiusMeters = effectiveRadiusKm * 1000;

    return restaurantRepository.findNearbyRestaurantsProjection(lat, lng, radiusMeters)
      .stream()
      .map(p -> new NearbyRestaurantResponse(
        p.getId(),
        p.getName(),
        p.getSlug(),
        p.getDescription(),
        p.getCity(),
        p.getLatitude(),
        p.getLongitude(),
        Boolean.TRUE.equals(p.getOpen()),
        Boolean.TRUE.equals(p.getSupportsDelivery()),
        Boolean.TRUE.equals(p.getSupportsPickup()),
        p.getAverageRating(),
        p.getTotalReviews() != null ? p.getTotalReviews() : 0,
        p.getDistanceKm() != null ? p.getDistanceKm() : 0.0
      ))
      .toList();  }

  @Transactional
  public RestaurantResponse create(RestaurantRequest request) {
    if (restaurantRepository.existsBySlug(request.slug())) {
      throw new IllegalArgumentException("Restaurant slug already exists");
    }

    Restaurant restaurant = Restaurant.builder()
      .name(request.name())
      .slug(request.slug())
      .description(request.description())
      .phone(request.phone())
      .email(request.email())
      .street(request.street())
      .streetNumber(request.streetNumber())
      .postalCode(request.postalCode())
      .city(request.city())
      .country(request.country() != null ? request.country() : "Switzerland")
      .latitude(request.latitude())
      .longitude(request.longitude())
      .active(request.active() != null ? request.active() : true)
      .open(request.open() != null ? request.open() : true)
      .supportsDelivery(request.supportsDelivery() != null ? request.supportsDelivery() : true)
      .supportsPickup(request.supportsPickup() != null ? request.supportsPickup() : true)
      .averageRating(BigDecimal.ZERO)
      .totalReviews(0)
      .build();

    return toResponse(restaurantRepository.save(restaurant));
  }

  @Transactional
  public RestaurantResponse update(UUID id, RestaurantRequest request) {
    Restaurant restaurant = getRestaurant(id);

    if (restaurantRepository.existsBySlugAndIdNot(request.slug(), id)) {
      throw new IllegalArgumentException("Restaurant slug already exists");
    }

    restaurant.setName(request.name());
    restaurant.setSlug(request.slug());
    restaurant.setDescription(request.description());
    restaurant.setPhone(request.phone());
    restaurant.setEmail(request.email());
    restaurant.setStreet(request.street());
    restaurant.setStreetNumber(request.streetNumber());
    restaurant.setPostalCode(request.postalCode());
    restaurant.setCity(request.city());
    restaurant.setCountry(request.country() != null ? request.country() : "Switzerland");
    restaurant.setLatitude(request.latitude());
    restaurant.setLongitude(request.longitude());

    if (request.active() != null) restaurant.setActive(request.active());
    if (request.open() != null) restaurant.setOpen(request.open());
    if (request.supportsDelivery() != null) restaurant.setSupportsDelivery(request.supportsDelivery());
    if (request.supportsPickup() != null) restaurant.setSupportsPickup(request.supportsPickup());

    return toResponse(restaurant);
  }

  @Transactional
  public RestaurantResponse updateStatus(UUID id, RestaurantStatusRequest request) {
    Restaurant restaurant = getRestaurant(id);

    if (request.active() != null) {
      restaurant.setActive(request.active());
    }

    if (request.open() != null) {
      restaurant.setOpen(request.open());
    }

    if (request.supportsDelivery() != null) {
      restaurant.setSupportsDelivery(request.supportsDelivery());
    }

    if (request.supportsPickup() != null) {
      restaurant.setSupportsPickup(request.supportsPickup());
    }

    return toResponse(restaurant);
  }

  @Transactional
  public void delete(UUID id) {
    Restaurant restaurant = getRestaurant(id);
    restaurantRepository.delete(restaurant);
  }

  private Restaurant getRestaurant(UUID id) {
    return restaurantRepository.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
  }

  private RestaurantResponse toResponse(Restaurant restaurant) {
    return new RestaurantResponse(
      restaurant.getId(),
      restaurant.getName(),
      restaurant.getSlug(),
      restaurant.getDescription(),
      restaurant.getPhone(),
      restaurant.getEmail(),
      restaurant.getStreet(),
      restaurant.getStreetNumber(),
      restaurant.getPostalCode(),
      restaurant.getCity(),
      restaurant.getCountry(),
      restaurant.getLatitude(),
      restaurant.getLongitude(),
      restaurant.isActive(),
      restaurant.isOpen(),
      restaurant.isSupportsDelivery(),
      restaurant.isSupportsPickup(),
      restaurant.getAverageRating(),
      restaurant.getTotalReviews()
    );
  }
}
