package com.restaurant.restaurantbackend.product.rule.marketing;


import com.restaurant.restaurantbackend.product.rule.marketing.dto.MarketingCampaignCreateRequest;
import com.restaurant.restaurantbackend.product.rule.marketing.dto.MarketingCampaignResponse;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import com.restaurant.restaurantbackend.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarketingCampaignService {

  private final MarketingCampaignRepository campaignRepository;
  private final RestaurantRepository restaurantRepository;

  @Transactional(readOnly = true)
  public List<MarketingCampaignResponse> findAll(UUID restaurantId) {
    return campaignRepository.findByRestaurantIdOrderByNameAsc(restaurantId)
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<MarketingCampaignResponse> findActive(UUID restaurantId) {
    return campaignRepository.findByRestaurantIdAndActiveTrueOrderByNameAsc(restaurantId)
      .stream()
      .map(this::toResponse)
      .toList();
  }

  @Transactional
  public MarketingCampaignResponse create(
    UUID restaurantId,
    MarketingCampaignCreateRequest request
  ) {
    Restaurant restaurant = restaurantRepository.findById(restaurantId)
      .orElseThrow(() -> new IllegalArgumentException(
        "Restaurant not found: " + restaurantId
      ));

    MarketingCampaign campaign = MarketingCampaign.builder()
      .restaurant(restaurant)
      .name(requireText(request.name(), "Campaign name is required"))
      .description(cleanText(request.description()))
      .startsAt(request.startsAt())
      .endsAt(request.endsAt())
      .active(!Boolean.FALSE.equals(request.active()))
      .customerVisible(!Boolean.FALSE.equals(request.customerVisible()))
      .customerTitle(cleanText(request.customerTitle()))
      .customerDescription(cleanText(request.customerDescription()))
      .build();

    return toResponse(campaignRepository.save(campaign));
  }

  @Transactional
  public void delete(
    UUID restaurantId,
    UUID campaignId
  ) {
    MarketingCampaign campaign = campaignRepository.findById(campaignId)
      .orElseThrow(() -> new IllegalArgumentException(
        "Campaign not found: " + campaignId
      ));

    if (
      campaign.getRestaurant() == null
        || !campaign.getRestaurant().getId().equals(restaurantId)
    ) {
      throw new IllegalArgumentException(
        "Campaign does not belong to restaurant: " + restaurantId
      );
    }

    campaignRepository.delete(campaign);
  }

  private MarketingCampaignResponse toResponse(MarketingCampaign campaign) {
    return new MarketingCampaignResponse(
      campaign.getId(),
      campaign.getName(),
      campaign.getDescription(),
      campaign.getStartsAt(),
      campaign.getEndsAt(),
      campaign.isActive(),
      campaign.isCustomerVisible(),
      campaign.getCustomerTitle(),
      campaign.getCustomerDescription()
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
}
