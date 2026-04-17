package com.restaurant.restaurantbackend.product.option;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "option_groups")
public class OptionGroup {

  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(length = 255)
  private String description;

  @Column(nullable = false)
  private Integer minSelections = 0;

  @Column(nullable = false)
  private Integer maxSelections = 1;

  @Column(nullable = false)
  private boolean required = false;

  @Column(nullable = false)
  private boolean isAvailable = true;

  @Column(nullable = false)
  private Integer displayOrder = 0;

  @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("displayOrder ASC")
  private List<OptionItem> items = new ArrayList<>();
}
