package com.restaurant.restaurantbackend.product.rule;

import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRule;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleDuplicatePolicyService;
import com.restaurant.restaurantbackend.product.rule.restaurant.RestaurantRuleRepository;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleCreateRequest;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleResponse;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleUpdateRequest;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RuleTagResponse;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantRuleLibraryService {

  private final RestaurantRuleRepository ruleRepository;
  private final RuleTagRepository tagRepository;
  private final RestaurantRepository restaurantRepository;
  private final RestaurantRuleDuplicatePolicyService duplicatePolicyService;

  @Transactional(readOnly = true)
  public List<RestaurantRuleResponse> findAll(UUID restaurantId) {
    return ruleRepository.findByRestaurantIdOrderByNameAsc(restaurantId)
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<RestaurantRuleResponse> findActive(UUID restaurantId) {
    return ruleRepository.findByRestaurantIdAndActiveTrueOrderByNameAsc(restaurantId)
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<RestaurantRuleResponse> findFavorites(UUID restaurantId) {
    return ruleRepository.findByRestaurantIdAndFavoriteTrueOrderByNameAsc(restaurantId)
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<RestaurantRuleResponse> findLibrary(UUID restaurantId) {
    return ruleRepository.findByRestaurantIdAndReusableTrueOrderByNameAsc(restaurantId)
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional
  public RestaurantRuleResponse create(
    UUID restaurantId,
    RestaurantRuleCreateRequest request
  ) {
    validateCreateRequest(request);

    Restaurant restaurant = findRestaurant(restaurantId);

    RestaurantRuleCreateRequest normalizedRequest =
      normalizeCreateRequest(request);

    duplicatePolicyService.validateLibraryRuleCreation(
      restaurantId,
      normalizedRequest
    );

    RestaurantRule rule = RestaurantRule.builder()
      .restaurant(restaurant)
      .name(requireText(normalizedRequest.name(), "Rule name is required"))
      .description(cleanText(normalizedRequest.description()))
      .ruleType(normalizedRequest.type())
      .condition(normalizedRequest.condition())
      .action(normalizedRequest.action())
      .active(!Boolean.FALSE.equals(normalizedRequest.active()))
      .favorite(Boolean.TRUE.equals(normalizedRequest.favorite()))
      .reusable(!Boolean.FALSE.equals(normalizedRequest.reusable()))
      .customerVisible(Boolean.TRUE.equals(normalizedRequest.customerVisible()))
      .customerTitle(cleanText(normalizedRequest.customerTitle()))
      .customerDescription(cleanText(normalizedRequest.customerDescription()))
      .internalOnly(!Boolean.TRUE.equals(normalizedRequest.customerVisible()))
      .tags(resolveTags(restaurant, normalizedRequest.tags()))
      .build();

    return toResponse(ruleRepository.save(rule));
  }

  @Transactional
  public RestaurantRuleResponse update(
    UUID restaurantId,
    UUID ruleId,
    RestaurantRuleUpdateRequest request
  ) {
    validateUpdateRequest(request);

    RestaurantRule rule = findRuleForRestaurant(restaurantId, ruleId);

    duplicatePolicyService.validateLibraryRuleUpdate(
      restaurantId,
      ruleId,
      rule,
      request
    );

    if (request.name() != null) {
      rule.setName(requireText(request.name(), "Rule name is required"));
    }

    if (request.description() != null) {
      rule.setDescription(cleanText(request.description()));
    }

    if (request.type() != null) {
      rule.setRuleType(request.type());
    }

    if (request.condition() != null) {
      rule.setCondition(request.condition());
    }

    if (request.action() != null) {
      rule.setAction(request.action());
    }

    if (request.active() != null) {
      rule.setActive(request.active());
    }

    if (request.favorite() != null) {
      rule.setFavorite(request.favorite());
    }

    if (request.reusable() != null) {
      rule.setReusable(request.reusable());
    }

    if (request.customerVisible() != null) {
      rule.setCustomerVisible(request.customerVisible());
      rule.setInternalOnly(!request.customerVisible());
    }

    if (request.customerTitle() != null) {
      rule.setCustomerTitle(cleanText(request.customerTitle()));
    }

    if (request.customerDescription() != null) {
      rule.setCustomerDescription(cleanText(request.customerDescription()));
    }

    if (request.tags() != null) {
      rule.setTags(resolveTags(rule.getRestaurant(), request.tags()));
    }

    return toResponse(ruleRepository.save(rule));
  }

  @Transactional
  public RestaurantRuleResponse toggleFavorite(
    UUID restaurantId,
    UUID ruleId
  ) {
    RestaurantRule rule = findRuleForRestaurant(restaurantId, ruleId);

    rule.setFavorite(!rule.isFavorite());

    return toResponse(ruleRepository.save(rule));
  }

  @Transactional
  public void delete(
    UUID restaurantId,
    UUID ruleId
  ) {
    RestaurantRule rule = findRuleForRestaurant(restaurantId, ruleId);

    ruleRepository.delete(rule);
  }

  private void validateCreateRequest(RestaurantRuleCreateRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("Rule creation request is required");
    }

    requireText(request.name(), "Rule name is required");

    if (request.type() == null) {
      throw new IllegalArgumentException("Rule type is required");
    }
  }

  private void validateUpdateRequest(RestaurantRuleUpdateRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("Rule update request is required");
    }
  }

  private RestaurantRuleCreateRequest normalizeCreateRequest(
    RestaurantRuleCreateRequest request
  ) {
    return new RestaurantRuleCreateRequest(
      request.name(),
      request.description(),
      request.type(),
      request.active(),
      request.favorite(),
      request.reusable(),
      request.customerVisible(),
      request.customerTitle(),
      request.customerDescription(),
      defaultCondition(request.condition()),
      defaultAction(request.action()),
      request.tags()
    );
  }

  private RestaurantRule findRuleForRestaurant(
    UUID restaurantId,
    UUID ruleId
  ) {
    RestaurantRule rule = ruleRepository.findById(ruleId)
      .orElseThrow(() -> new IllegalArgumentException(
        "Rule not found: " + ruleId
      ));

    if (
      rule.getRestaurant() == null
        || rule.getRestaurant().getId() == null
        || !rule.getRestaurant().getId().equals(restaurantId)
    ) {
      throw new IllegalArgumentException(
        "Rule does not belong to restaurant: " + restaurantId
      );
    }

    return rule;
  }

  private Restaurant findRestaurant(UUID restaurantId) {
    return restaurantRepository.findById(restaurantId)
      .orElseThrow(() -> new IllegalArgumentException(
        "Restaurant not found: " + restaurantId
      ));
  }

  private Set<RuleTag> resolveTags(
    Restaurant restaurant,
    List<String> tagNames
  ) {
    if (tagNames == null || tagNames.isEmpty()) {
      return new HashSet<>();
    }

    Set<RuleTag> tags = new HashSet<>();

    for (String tagName : tagNames) {
      String cleanedName = cleanText(tagName);

      if (cleanedName == null) {
        continue;
      }

      RuleTag tag = tagRepository.findByRestaurantIdAndNameIgnoreCase(
          restaurant.getId(),
          cleanedName
        )
        .orElseGet(() -> tagRepository.save(
          RuleTag.builder()
            .restaurant(restaurant)
            .name(cleanedName)
            .color(defaultTagColor(cleanedName))
            .build()
        ));

      tags.add(tag);
    }

    return tags;
  }

  private RestaurantRuleResponse toResponse(RestaurantRule rule) {
    List<RuleTagResponse> tags = rule.getTags() == null
      ? List.of()
      : rule.getTags()
      .stream()
      .map(tag -> new RuleTagResponse(
        tag.getId(),
        tag.getName(),
        tag.getColor()
      ))
      .sorted((left, right) -> left.name().compareToIgnoreCase(right.name()))
      .toList();

    return new RestaurantRuleResponse(
      rule.getId(),
      rule.getName(),
      rule.getDescription(),
      rule.getRuleType(),
      rule.isActive(),
      rule.isFavorite(),
      rule.isReusable(),
      rule.isCustomerVisible(),
      rule.getCustomerTitle(),
      rule.getCustomerDescription(),
      rule.getCondition(),
      rule.getAction(),
      tags
    );
  }

  private RuleCondition defaultCondition(RuleCondition condition) {
    return condition != null
      ? condition
      : new RuleCondition(
      null,
      null,
      null,
      null,
      null,
      List.of(),
      null,
      null,
      List.of()
    );
  }

  private RuleAction defaultAction(RuleAction action) {
    return action != null
      ? action
      : new RuleAction(
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
  }

  private String requireText(
    String value,
    String message
  ) {
    String cleaned = cleanText(value);

    if (cleaned == null) {
      throw new IllegalArgumentException(message);
    }

    return cleaned;
  }

  private String cleanText(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }

    return value.strip();
  }

  private String defaultTagColor(String tagName) {
    String normalized = tagName.toLowerCase();

    if (normalized.contains("promo")) {
      return "#ef4444";
    }

    if (normalized.contains("menu")) {
      return "#f97316";
    }

    if (normalized.contains("livraison")) {
      return "#2563eb";
    }

    if (normalized.contains("étudiant") || normalized.contains("etudiant")) {
      return "#16a34a";
    }

    return "#64748b";
  }
}
