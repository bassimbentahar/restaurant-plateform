package com.restaurant.restaurantbackend.product.rule.marketing.dto;

import java.time.LocalDateTime;

public record MarketingCampaignCreateRequest(
  String name,
  String description,
  LocalDateTime startsAt,
  LocalDateTime endsAt,
  Boolean active,
  Boolean customerVisible,
  String customerTitle,
  String customerDescription
) {
}
