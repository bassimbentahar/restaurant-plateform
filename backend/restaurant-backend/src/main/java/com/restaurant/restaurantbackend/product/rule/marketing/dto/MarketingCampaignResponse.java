package com.restaurant.restaurantbackend.product.rule.marketing.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MarketingCampaignResponse(
  UUID id,
  String name,
  String description,
  LocalDateTime startsAt,
  LocalDateTime endsAt,
  boolean active,
  boolean customerVisible,
  String customerTitle,
  String customerDescription
) {
}
