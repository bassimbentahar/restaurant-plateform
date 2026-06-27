package com.restaurant.restaurantbackend.product.rule.marketing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, UUID> {

  List<MarketingCampaign> findByRestaurantIdOrderByNameAsc(UUID restaurantId);

  List<MarketingCampaign> findByRestaurantIdAndActiveTrueOrderByNameAsc(UUID restaurantId);
}
