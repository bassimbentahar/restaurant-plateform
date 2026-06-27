package com.restaurant.restaurantbackend.product.rule;

import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleCreateRequest;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleResponse;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/rules")
@RequiredArgsConstructor
public class RestaurantRuleController {

  private final RestaurantRuleLibraryService ruleLibraryService;

  @GetMapping
  public List<RestaurantRuleResponse> findAll(
    @PathVariable UUID restaurantId
  ) {
    return ruleLibraryService.findAll(restaurantId);
  }

  @GetMapping("/active")
  public List<RestaurantRuleResponse> findActive(
    @PathVariable UUID restaurantId
  ) {
    return ruleLibraryService.findActive(restaurantId);
  }

  @GetMapping("/favorites")
  public List<RestaurantRuleResponse> findFavorites(
    @PathVariable UUID restaurantId
  ) {
    return ruleLibraryService.findFavorites(restaurantId);
  }

  @GetMapping("/library")
  public List<RestaurantRuleResponse> findLibrary(
    @PathVariable UUID restaurantId
  ) {
    return ruleLibraryService.findLibrary(restaurantId);
  }

  @PostMapping
  public RestaurantRuleResponse create(
    @PathVariable UUID restaurantId,
    @RequestBody RestaurantRuleCreateRequest request
  ) {
    return ruleLibraryService.create(restaurantId, request);
  }

  @PutMapping("/{ruleId}")
  public RestaurantRuleResponse update(
    @PathVariable UUID restaurantId,
    @PathVariable UUID ruleId,
    @RequestBody RestaurantRuleUpdateRequest request
  ) {
    return ruleLibraryService.update(restaurantId, ruleId, request);
  }

  @PatchMapping("/{ruleId}/favorite")
  public RestaurantRuleResponse toggleFavorite(
    @PathVariable UUID restaurantId,
    @PathVariable UUID ruleId
  ) {
    return ruleLibraryService.toggleFavorite(restaurantId, ruleId);
  }

  @DeleteMapping("/{ruleId}")
  public void delete(
    @PathVariable UUID restaurantId,
    @PathVariable UUID ruleId
  ) {
    ruleLibraryService.delete(restaurantId, ruleId);
  }
}
