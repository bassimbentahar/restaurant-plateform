package com.restaurant.restaurantbackend.product.rule.restaurant;

import com.restaurant.restaurantbackend.product.Product;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.rule.dto.ProductRuleRequest;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Application service responsible for creating restaurant rules during product creation.
 *
 * <p>This service belongs to the write side of the rule domain.
 * It converts frontend product rule requests into persistent rule entities:
 *
 * <pre>
 * ProductRuleRequest
 *     -> RestaurantRule
 *     -> RestaurantRuleAssignment
 * </pre>
 *
 * <p>Important domain distinction:
 * <ul>
 *   <li>{@link RestaurantRule} describes what the rule does.</li>
 *   <li>{@link RestaurantRuleAssignment} describes where the rule is applied.</li>
 * </ul>
 *
 * <p>Examples:
 * <ul>
 *   <li>Rule: "Happy hour drinks discount".</li>
 *   <li>Assignment: applied to one product, one variant or one option group.</li>
 * </ul>
 *
 * <p>This service does not execute rules. Rule execution belongs to
 * {@code RestaurantRuleEngine} on the read side.
 *
 * <p>This service also does not search product variants or option groups from
 * the database. During product creation, it receives temporary lookup maps:
 * <ul>
 *   <li>{@code variantsByClientId}: frontend variant clientId to backend variant.</li>
 *   <li>{@code optionGroupsByClientId}: frontend option group clientId to backend option group.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class RestaurantRuleApplicationService {

  private final RestaurantRuleRepository ruleRepository;
  private final RestaurantRuleAssignmentRepository assignmentRepository;

  /**
   * Creates all rules submitted inside a product creation request.
   *
   * <p>If the request contains no rules, the method returns immediately.
   *
   * @param product the saved product
   * @param restaurant the current restaurant
   * @param requestRules the rule requests submitted by the frontend
   * @param variantsByClientId lookup map from frontend variant clientId to variant entity
   * @param optionGroupsByClientId lookup map from frontend option group clientId to option group entity
   */
  public void createRulesForProduct(
    Product product,
    Restaurant restaurant,
    List<ProductRuleRequest> requestRules,
    Map<String, ProductVariant> variantsByClientId,
    Map<String, OptionGroup> optionGroupsByClientId
  ) {
    Objects.requireNonNull(product, "Product must not be null");
    Objects.requireNonNull(restaurant, "Restaurant must not be null");

    if (requestRules == null || requestRules.isEmpty()) {
      return;
    }

    Map<String, ProductVariant> safeVariantsByClientId =
      variantsByClientId == null ? Map.of() : variantsByClientId;

    Map<String, OptionGroup> safeOptionGroupsByClientId =
      optionGroupsByClientId == null ? Map.of() : optionGroupsByClientId;

    for (ProductRuleRequest requestRule : requestRules) {
      validateRuleRequest(requestRule);

      RestaurantRule savedRule = ruleRepository.save(
        buildRule(restaurant, requestRule)
      );

      RestaurantRuleAssignment assignment = buildAssignment(
        savedRule,
        product,
        restaurant,
        requestRule,
        safeVariantsByClientId,
        safeOptionGroupsByClientId
      );

      assignmentRepository.save(assignment);
    }
  }

  /**
   * Builds the reusable rule definition.
   *
   * <p>The rule stores:
   * <ul>
   *   <li>Business name and description.</li>
   *   <li>Rule type.</li>
   *   <li>Condition.</li>
   *   <li>Action.</li>
   *   <li>Visibility metadata.</li>
   * </ul>
   *
   * <p>The rule does not know by itself where it is applied. That information
   * belongs to {@link RestaurantRuleAssignment}.
   */
  private RestaurantRule buildRule(
    Restaurant restaurant,
    ProductRuleRequest request
  ) {
    boolean active = isActive(request.enabled());
    boolean favorite = Boolean.TRUE.equals(request.favorite());
    boolean reusable = Boolean.TRUE.equals(request.reusable());
    boolean customerVisible = Boolean.TRUE.equals(request.customerVisible());

    return RestaurantRule.builder()
      .restaurant(restaurant)
      .name(request.name().strip())
      .description(normalizeBlankToNull(request.description()))
      .ruleType(request.type())
      .condition(request.condition())
      .action(request.action())
      .active(active)
      .favorite(favorite)
      .reusable(reusable)
      .customerVisible(customerVisible)
      .customerTitle(normalizeBlankToNull(request.customerTitle()))
      .customerDescription(normalizeBlankToNull(request.customerDescription()))
      .internalOnly(!customerVisible)
      .build();
  }

  /**
   * Builds the rule assignment.
   *
   * <p>The assignment links a rule to its target.
   *
   * <p>Supported targets during product creation:
   * <ul>
   *   <li>{@code RESTAURANT}: applies to the current restaurant.</li>
   *   <li>{@code PRODUCT}: applies to the product being created.</li>
   *   <li>{@code VARIANT}: applies to a variant referenced by clientId.</li>
   *   <li>{@code OPTION_GROUP}: applies to an option group referenced by clientId.</li>
   * </ul>
   *
   * <p>Other targets such as category or option item can be added later with
   * dedicated resolvers.
   */
  private RestaurantRuleAssignment buildAssignment(
    RestaurantRule rule,
    Product product,
    Restaurant restaurant,
    ProductRuleRequest request,
    Map<String, ProductVariant> variantsByClientId,
    Map<String, OptionGroup> optionGroupsByClientId
  ) {
    boolean active = isActive(request.enabled());

    RestaurantRuleAssignment.RestaurantRuleAssignmentBuilder builder =
      RestaurantRuleAssignment.builder()
        .restaurant(restaurant)
        .rule(rule)
        .targetType(request.targetType())
        .priority(request.priority() != null ? request.priority() : 0)
        .active(active);

    switch (request.targetType()) {
      case RESTAURANT -> {
        // No additional target entity is required.
      }

      case PRODUCT -> builder.product(product);

      case VARIANT -> {
        ProductVariant variant = resolveVariant(
          request.variantClientId(),
          variantsByClientId
        );

        builder.product(product);
        builder.variant(variant);
      }

      case OPTION_GROUP -> {
        OptionGroup optionGroup = resolveOptionGroup(
          request.optionGroupClientId(),
          optionGroupsByClientId
        );

        builder.product(product);
        builder.optionGroup(optionGroup);

        if (hasText(request.variantClientId())) {
          ProductVariant variant = resolveVariant(
            request.variantClientId(),
            variantsByClientId
          );

          builder.variant(variant);
        }
      }

      default -> throw new IllegalArgumentException(
        "Unsupported target type during product creation: " + request.targetType()
      );
    }

    return builder.build();
  }

  /**
   * Resolves a variant from the temporary frontend clientId.
   */
  private ProductVariant resolveVariant(
    String variantClientId,
    Map<String, ProductVariant> variantsByClientId
  ) {
    if (!hasText(variantClientId)) {
      throw new IllegalArgumentException(
        "variantClientId is required for VARIANT rule target"
      );
    }

    ProductVariant variant = variantsByClientId.get(variantClientId);

    if (variant == null) {
      throw new IllegalArgumentException(
        "Unknown variant clientId: " + variantClientId
      );
    }

    return variant;
  }

  /**
   * Resolves an option group from the temporary frontend clientId.
   */
  private OptionGroup resolveOptionGroup(
    String optionGroupClientId,
    Map<String, OptionGroup> optionGroupsByClientId
  ) {
    if (!hasText(optionGroupClientId)) {
      throw new IllegalArgumentException(
        "optionGroupClientId is required for OPTION_GROUP rule target"
      );
    }

    OptionGroup optionGroup = optionGroupsByClientId.get(optionGroupClientId);

    if (optionGroup == null) {
      throw new IllegalArgumentException(
        "Unknown optionGroupClientId: " + optionGroupClientId
      );
    }

    return optionGroup;
  }

  /**
   * Validates the minimum required data for a rule request.
   */
  private void validateRuleRequest(ProductRuleRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("Rule request must not be null");
    }

    if (!hasText(request.name())) {
      throw new IllegalArgumentException("Rule name is required");
    }

    if (request.type() == null) {
      throw new IllegalArgumentException("Rule type is required");
    }

    if (request.targetType() == null) {
      throw new IllegalArgumentException("Rule targetType is required");
    }

    if (request.action() == null) {
      throw new IllegalArgumentException("Rule action is required");
    }
  }

  /**
   * By default, a rule is active unless the frontend explicitly sends false.
   */
  private boolean isActive(Boolean value) {
    return !Boolean.FALSE.equals(value);
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }

  private String normalizeBlankToNull(String value) {
    return hasText(value) ? value.strip() : null;
  }

  public void replaceRulesForProduct(
    Product product,
    Restaurant restaurant,
    List<ProductRuleRequest> requestRules,
    Map<String, ProductVariant> variantsByClientId,
    Map<String, OptionGroup> optionGroupsByClientId
  ) {
    Objects.requireNonNull(product, "Product must not be null");
    Objects.requireNonNull(restaurant, "Restaurant must not be null");

    deleteExistingRulesForProduct(product);

    createRulesForProduct(
      product,
      restaurant,
      requestRules,
      variantsByClientId,
      optionGroupsByClientId
    );
  }

  private void deleteExistingRulesForProduct(Product product) {
    if (product.getId() == null) {
      return;
    }

    List<RestaurantRuleAssignment> existingAssignments =
      assignmentRepository.findByProductId(product.getId());

    if (existingAssignments.isEmpty()) {
      return;
    }

    List<RestaurantRule> rulesToDelete =
      existingAssignments
        .stream()
        .map(RestaurantRuleAssignment::getRule)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

    assignmentRepository.deleteAll(existingAssignments);
    assignmentRepository.flush();

    rulesToDelete
      .stream()
      .filter(this::shouldDeleteRuleAfterProductReplacement)
      .forEach(ruleRepository::delete);

    ruleRepository.flush();
  }

  private boolean shouldDeleteRuleAfterProductReplacement(
    RestaurantRule rule
  ) {
    if (rule.getId() == null) {
      return false;
    }

    boolean ruleStillAssignedSomewhere =
      assignmentRepository.existsByRuleId(rule.getId());

    if (ruleStillAssignedSomewhere) {
      return false;
    }

    /*
     * Si la règle est réutilisable, on la garde dans la bibliothèque.
     * Si elle n'est pas réutilisable et n'a plus d'assignation,
     * on peut la supprimer.
     */
    return !rule.isReusable();
  }
}
