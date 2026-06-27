package com.restaurant.restaurantbackend.product.option;

import com.restaurant.restaurantbackend.product.option.item.dto.OptionGroupLibraryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/option-groups")
public class OptionGroupController {

  private final OptionGroupService optionGroupService;

  @GetMapping
  public ResponseEntity<List<OptionGroupLibraryResponse>> getOptionGroups() {
    return ResponseEntity.ok(optionGroupService.getLibraryOptionGroups());
  }
}
