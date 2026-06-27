package com.restaurant.restaurantbackend.product.rule.marketing;

import com.restaurant.restaurantbackend.product.rule.marketing.dto.MarketingCampaignCreateRequest;
import com.restaurant.restaurantbackend.product.rule.marketing.dto.MarketingCampaignResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/campaigns")
@RequiredArgsConstructor
public class MarketingCampaignController {

  private final MarketingCampaignService campaignService;

  @GetMapping
  public List<MarketingCampaignResponse> findAll(
    @PathVariable UUID restaurantId
  ) {
    return campaignService.findAll(restaurantId);
  }

  @GetMapping("/active")
  public List<MarketingCampaignResponse> findActive(
    @PathVariable UUID restaurantId
  ) {
    return campaignService.findActive(restaurantId);
  }

  @PostMapping
  public MarketingCampaignResponse create(
    @PathVariable UUID restaurantId,
    @RequestBody MarketingCampaignCreateRequest request
  ) {
    return campaignService.create(restaurantId, request);
  }

  @DeleteMapping("/{campaignId}")
  public void delete(
    @PathVariable UUID restaurantId,
    @PathVariable UUID campaignId
  ) {
    campaignService.delete(restaurantId, campaignId);
  }
}
