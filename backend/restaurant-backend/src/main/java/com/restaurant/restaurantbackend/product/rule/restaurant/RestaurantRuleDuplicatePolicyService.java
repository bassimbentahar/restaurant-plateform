package com.restaurant.restaurantbackend.product.rule.restaurant;


import com.restaurant.restaurantbackend.product.exception.DuplicateRestaurantRuleException;
import com.restaurant.restaurantbackend.product.rule.dto.ProductRuleRequest;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleCreateRequest;
import com.restaurant.restaurantbackend.product.rule.restaurant.dto.RestaurantRuleUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantRuleDuplicatePolicyService {

  private final RestaurantRuleRepository restaurantRuleRepository;
  private final RestaurantRuleSignatureService signatureService;

  public void validateProductRules(List<ProductRuleRequest> rules) {
    if (rules == null || rules.isEmpty()) {
      return;
    }

    Set<UUID> sourceRuleIds = new HashSet<>();
    Set<String> businessSignatures = new HashSet<>();

    for (ProductRuleRequest rule : rules) {
      validateLibrarySourceRule(rule, sourceRuleIds);
      validateBusinessSignature(rule, businessSignatures);
    }
  }

  public void validateLibraryRuleCreation(
    UUID restaurantId,
    RestaurantRuleCreateRequest request
  ) {
    if (!isReusableOnCreate(request)) {
      return;
    }

    String newSignature = signatureService.fromCreateRequest(request);

    boolean alreadyExists = restaurantRuleRepository
      .findByRestaurantIdAndReusableTrueOrderByNameAsc(restaurantId)
      .stream()
      .map(signatureService::fromEntity)
      .anyMatch(existingSignature -> existingSignature.equals(newSignature));

    if (alreadyExists) {
      throw new DuplicateRestaurantRuleException(
        "Une règle identique existe déjà dans la bibliothèque."
      );
    }
  }

  public void validateLibraryRuleUpdate(
    UUID restaurantId,
    UUID currentRuleId,
    RestaurantRule currentRule,
    RestaurantRuleUpdateRequest request
  ) {
    if (!isReusableAfterUpdate(currentRule, request)) {
      return;
    }

    String newSignature = signatureService.fromUpdateRequest(
      currentRule,
      request
    );

    boolean alreadyExists = restaurantRuleRepository
      .findByRestaurantIdAndReusableTrueOrderByNameAsc(restaurantId)
      .stream()
      .filter(rule -> !rule.getId().equals(currentRuleId))
      .map(signatureService::fromEntity)
      .anyMatch(existingSignature -> existingSignature.equals(newSignature));

    if (alreadyExists) {
      throw new DuplicateRestaurantRuleException(
        "Une règle identique existe déjà dans la bibliothèque."
      );
    }
  }

  private void validateLibrarySourceRule(
    ProductRuleRequest rule,
    Set<UUID> sourceRuleIds
  ) {
    if (rule.sourceRuleId() == null) {
      return;
    }

    boolean added = sourceRuleIds.add(rule.sourceRuleId());

    if (!added) {
      throw new DuplicateRestaurantRuleException(
        "Cette règle de bibliothèque est déjà ajoutée à ce produit."
      );
    }
  }

  private void validateBusinessSignature(
    ProductRuleRequest rule,
    Set<String> businessSignatures
  ) {
    String signature = signatureService.fromProductRuleRequest(rule);

    boolean added = businessSignatures.add(signature);

    if (!added) {
      throw new DuplicateRestaurantRuleException(
        "Une règle identique existe déjà sur ce produit."
      );
    }
  }

  private boolean isReusableOnCreate(RestaurantRuleCreateRequest request) {
    if (request == null) {
      return false;
    }

    return !Boolean.FALSE.equals(request.reusable());
  }

  private boolean isReusableAfterUpdate(
    RestaurantRule currentRule,
    RestaurantRuleUpdateRequest request
  ) {
    if (request == null) {
      return currentRule.isReusable();
    }

    if (request.reusable() != null) {
      return request.reusable();
    }

    return currentRule.isReusable();
  }
}
