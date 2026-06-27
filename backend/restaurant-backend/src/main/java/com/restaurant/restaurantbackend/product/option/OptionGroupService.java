package com.restaurant.restaurantbackend.product.option;

import com.restaurant.restaurantbackend.product.option.item.dto.OptionGroupLibraryResponse;
import com.restaurant.restaurantbackend.product.option.item.dto.OptionItemLibraryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OptionGroupService {

  private final OptionGroupRepository optionGroupRepository;

  public List<OptionGroupLibraryResponse> getLibraryOptionGroups() {
    return optionGroupRepository.findAll().stream()
      .map(this::toLibraryResponse)
      .toList();
  }

  private OptionGroupLibraryResponse toLibraryResponse(OptionGroup group) {
    return new OptionGroupLibraryResponse(
      group.getId(),
      group.getName(),
      group.getDescription(),
      group.isRequired(),
      group.getMinSelections(),
      group.getMaxSelections(),
      0,
      group.getItems().stream()
        .map(item -> new OptionItemLibraryResponse(
          item.getId(),
          item.getName(),
          item.getDescription(),
          item.getPriceAdjustment(),
          item.isAvailable(),
          item.getDisplayOrder()
        ))
        .toList()
    );
  }
}
