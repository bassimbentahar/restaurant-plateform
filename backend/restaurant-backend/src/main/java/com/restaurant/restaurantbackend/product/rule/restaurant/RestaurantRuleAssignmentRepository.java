package com.restaurant.restaurantbackend.product.rule.restaurant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RestaurantRuleAssignmentRepository
  extends JpaRepository<RestaurantRuleAssignment, UUID> {

  @Query("""
    select assignment
    from RestaurantRuleAssignment assignment
    join fetch assignment.rule rule
    where assignment.restaurant.id = :restaurantId
      and assignment.active = true
      and rule.active = true
      and (assignment.startsAt is null or assignment.startsAt <= :now)
      and (assignment.endsAt is null or assignment.endsAt >= :now)
      and (
        assignment.targetType = 'RESTAURANT'
        or assignment.product.id = :productId
        or assignment.variant.id in :variantIds
        or assignment.optionGroup.id in :optionGroupIds
        or assignment.category.id in :categoryIds
      )
    order by assignment.priority asc
  """)
  List<RestaurantRuleAssignment> findActiveAssignmentsForProductCatalog(
    UUID restaurantId,
    UUID productId,
    Collection<UUID> variantIds,
    Collection<UUID> optionGroupIds,
    Collection<UUID> categoryIds,
    LocalDateTime now
  );
}
