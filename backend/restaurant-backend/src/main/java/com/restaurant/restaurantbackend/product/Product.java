package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.category.ProductCategory;
import com.restaurant.restaurantbackend.product.image.ProductImage;
import com.restaurant.restaurantbackend.product.option.OptionGroup;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Getter
@Setter
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

  @Column(nullable = false, unique = true, length = 100)
  private String sku;

  @Column(nullable = false, unique = false, length = 100)
  private String slug;

  @Column(nullable = false)
  private String title;

  @Column(length = 255)
  private String shortDescription;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  private String thumb;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal basePrice;

  private boolean isAvailable;

  private boolean isFeatured;

  private boolean isArchived;

  private int preparationTimeMinutes;

  private LocalTime availableFrom;
  private LocalTime availableTo;

  private Integer calories;

  @Column(name = "ingredients_text", columnDefinition = "TEXT")
  private String ingredientsText;

  @Column(name = "allergens_text", columnDefinition = "TEXT")
  private String allergensText;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private ProductCategory category;

  @OneToMany(mappedBy = "product", orphanRemoval = true, cascade = CascadeType.ALL)
  @OrderBy("displayOrder ASC")
  private List<ProductImage> images;

  @OneToMany(mappedBy = "product", orphanRemoval = true, cascade = CascadeType.ALL)
  @OrderBy("displayOrder ASC")
  private List<ProductVariant> variants;

  @ManyToMany
  @JoinTable(
    name = "product_option_groups",
    joinColumns = @JoinColumn(name = "product_id"),
    inverseJoinColumns = @JoinColumn(name = "option_group_id")
  )
  @OrderBy("displayOrder ASC")
  private List<OptionGroup> optionGroups;

  public BigDecimal calculatePrice(){
    return null;
  }
}
