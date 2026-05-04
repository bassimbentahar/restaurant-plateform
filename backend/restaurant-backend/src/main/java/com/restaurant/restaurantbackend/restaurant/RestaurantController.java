package com.restaurant.restaurantbackend.restaurant;

import com.restaurant.restaurantbackend.restaurant.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

  private final RestaurantService restaurantService;

  @GetMapping
  public List<RestaurantResponse> findAll(
    @RequestParam(required = false, defaultValue = "false") boolean activeOnly
  ) {
    if (activeOnly) {
      return restaurantService.findActiveRestaurants();
    }

    return restaurantService.findAll();
  }

  @GetMapping("/slug/{slug}")
  public RestaurantResponse findBySlug(@PathVariable String slug) {
    return restaurantService.findBySlug(slug);
  }

  @GetMapping("/nearby")
  public List<NearbyRestaurantResponse> nearby(
    @RequestParam double lat,
    @RequestParam double lng,
    @RequestParam(required = false) Double radiusKm
  ) {
    return restaurantService.findNearby(lat, lng, radiusKm);
  }

  @GetMapping("/{id}")
  public RestaurantResponse findById(@PathVariable UUID id) {
    return restaurantService.findById(id);
  }

  @PostMapping
  public RestaurantResponse create(@Valid @RequestBody RestaurantRequest request) {
    return restaurantService.create(request);
  }

  @PutMapping("/{id}")
  public RestaurantResponse update(
    @PathVariable UUID id,
    @Valid @RequestBody RestaurantRequest request
  ) {
    return restaurantService.update(id, request);
  }

  @PatchMapping("/{id}/status")
  public RestaurantResponse updateStatus(
    @PathVariable UUID id,
    @RequestBody RestaurantStatusRequest request
  ) {
    return restaurantService.updateStatus(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) {
    restaurantService.delete(id);
  }
}
