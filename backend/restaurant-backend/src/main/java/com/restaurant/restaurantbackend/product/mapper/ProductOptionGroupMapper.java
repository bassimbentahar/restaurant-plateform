package com.restaurant.restaurantbackend.product.mapper;

import java.util.ArrayList;
import java.util.List;

import com.restaurant.restaurantbackend.product.dto.request.ProductOptionGroupRequest;
import com.restaurant.restaurantbackend.product.dto.response.ProductOptionGroupResponse;
import com.restaurant.restaurantbackend.product.dto.response.ProductOptionItemResponse;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.option.OptionItem;
import org.springframework.stereotype.Component;

@Component
public class ProductOptionGroupMapper {

  private final ProductOptionItemMapper optionItemMapper;

  public ProductOptionGroupMapper(ProductOptionItemMapper optionItemMapper) {
    this.optionItemMapper = optionItemMapper;
  }

  public ProductOptionGroupResponse toResponse(OptionGroup group) {
    if (group == null) {
      return null;
    }

    List<ProductOptionItemResponse> options = group.getItems() == null
      ? List.of()
      : group.getItems().stream()
      .map(optionItemMapper::toResponse)
      .toList();

    boolean multiple = group.getMaxSelections() != null && group.getMaxSelections() > 1;
    String displayType = multiple ? "checkbox" : "radio";

    return new ProductOptionGroupResponse(
      group.getId(),
      group.getName(),
      group.getDescription(),
      displayType,
      group.isRequired(),
      multiple,
      group.getMinSelections(),
      group.getMaxSelections(),
      true,
      group.getDisplayOrder(),
      options
    );
  }

  public OptionGroup toEntity(ProductOptionGroupRequest request) {
    if (request == null) {
      return null;
    }

    OptionGroup group = new OptionGroup();
    group.setName(request.name());
    group.setDescription(request.description());
    group.setMinSelections(request.minSelections() != null ? request.minSelections() : 0);
    group.setMaxSelections(request.maxSelections() != null ? request.maxSelections() : 1);
    group.setRequired(request.required());
    group.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);

    List<OptionItem> items = new ArrayList<>();
    if (request.items() != null) {
      for (var itemRequest : request.items()) {
        OptionItem item = optionItemMapper.toEntity(itemRequest, group);
        items.add(item);
      }
    }
    group.setItems(items);

    return group;
  }
}
