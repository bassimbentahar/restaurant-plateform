package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.common.BaseEntity;
import com.restaurant.restaurantbackend.product.category.productCategoryLink.ProductCategoryLink;
import com.restaurant.restaurantbackend.product.image.ProductImage;
import com.restaurant.restaurantbackend.product.option.ProductOptionGroupLink;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import com.restaurant.restaurantbackend.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Getter
@Setter
@Entity
@Table(
  name = "products",
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_products_restaurant_sku",
      columnNames = {"restaurant_id", "sku"}
    ),
    @UniqueConstraint(
      name = "uk_products_restaurant_slug",
      columnNames = {"restaurant_id", "slug"}
    )
  }
)
public class Product extends BaseEntity {

  @Column(nullable = false, length = 100)
  private String sku;

  @Column(nullable = false, length = 100)
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

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restaurant_id", nullable = false)
  private Restaurant restaurant;

  @OneToMany(mappedBy = "product", orphanRemoval = true, cascade = CascadeType.ALL)
  @OrderBy("displayOrder ASC")
  private List<ProductCategoryLink> categories;

  @OneToMany(mappedBy = "product", orphanRemoval = true, cascade = CascadeType.ALL)
  @OrderBy("displayOrder ASC")
  private List<ProductImage> images;

  @OneToMany(mappedBy = "product", orphanRemoval = true, cascade = CascadeType.ALL)
  @OrderBy("displayOrder ASC")
  private List<ProductVariant> variants;

  @OneToMany(
    mappedBy = "product",
    orphanRemoval = true,
    cascade = CascadeType.ALL
  )
  @OrderBy("displayOrder ASC")
  private List<ProductOptionGroupLink> optionGroups;

  public BigDecimal calculatePrice(){
    return null;
  }
}
