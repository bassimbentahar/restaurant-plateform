package com.restaurant.restaurantbackend.product.mapper;

import java.math.BigDecimal;

import com.restaurant.restaurantbackend.product.dto.request.ProductOptionItemRequest;
import com.restaurant.restaurantbackend.product.dto.response.ProductOptionItemResponse;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.option.OptionItem;
import org.springframework.stereotype.Component;

@Component
public class ProductOptionItemMapper {

  public ProductOptionItemResponse toResponse(OptionItem item) {
    if (item == null) {
      return null;
    }

    return new ProductOptionItemResponse(
      item.getId(),
      item.getName(),
      item.getDescription(),
      item.getPriceAdjustment(),
      item.isDefault(),
      item.isAvailable(),
      item.getDisplayOrder()
    );
  }

  public OptionItem toEntity(ProductOptionItemRequest request, OptionGroup optionGroup) {
    if (request == null) {
      return null;
    }

    OptionItem item = new OptionItem();
    item.setName(request.name());
    item.setDescription(request.description());
    item.setPriceAdjustment(
      request.priceAdjustment() != null ? request.priceAdjustment() : BigDecimal.ZERO
    );
    item.setDefault(request.isDefault());
    item.setAvailable(request.isAvailable());
    item.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
    item.setOptionGroup(optionGroup);
    return item;
  }
}
