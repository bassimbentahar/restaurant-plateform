package com.restaurant.restaurantbackend.product.slug;

import com.restaurant.restaurantbackend.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductSlugService {

  private static final String DEFAULT_SLUG = "produit";

  private final ProductRepository productRepository;

  public String generateUniqueSlug(
    UUID restaurantId,
    String requestedSlug,
    String title
  ) {
    String baseSlug = slugify(
      hasText(requestedSlug) ? requestedSlug : title
    );

    if (!hasText(baseSlug)) {
      baseSlug = DEFAULT_SLUG;
    }

    String candidate = baseSlug;
    int suffix = 2;

    while (productRepository.existsByRestaurantIdAndSlug(restaurantId, candidate)) {
      candidate = baseSlug + "-" + suffix;
      suffix++;
    }

    return candidate;
  }

  private String slugify(String value) {
    if (value == null) {
      return "";
    }

    String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
      .replaceAll("\\p{M}", "");

    return normalized
      .toLowerCase(Locale.ROOT)
      .replaceAll("[^a-z0-9]+", "-")
      .replaceAll("^-+", "")
      .replaceAll("-+$", "");
  }

  private boolean hasText(String value) {
    return value != null && !value.trim().isEmpty();
  }
}
