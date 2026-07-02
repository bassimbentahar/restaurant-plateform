package com.restaurant.restaurantbackend.product;

import com.restaurant.restaurantbackend.product.dto.ResolvedOptionGroup;
import com.restaurant.restaurantbackend.product.dto.ResolvedProduct;
import com.restaurant.restaurantbackend.product.dto.ResolvedProductVariant;
import com.restaurant.restaurantbackend.product.dto.response.ProductResponse;
import com.restaurant.restaurantbackend.product.exception.ProductNotFoundException;
import com.restaurant.restaurantbackend.product.mapper.ProductMapper;
import com.restaurant.restaurantbackend.product.option.OptionGroupResolutionService;
import com.restaurant.restaurantbackend.product.option.ProductOptionResolutionContext;
import com.restaurant.restaurantbackend.product.variant.ProductVariant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCatalogQueryService {

  private final ProductRepository productRepository;
  private final OptionGroupResolutionService resolutionService;
  private final ProductMapper productMapper;
  private static final UUID DEFAULT_RESTAURANT_ID =
    UUID.fromString("01000000-0000-0000-0000-000000000001");

  public List<ProductResponse> getProducts() {
    return productRepository.findPublishedProductsForClient(
        DEFAULT_RESTAURANT_ID
      )
      .stream()
      .map(this::resolveProduct)
      .map(productMapper::toProductResponse)
      .toList();
  }

  public ProductResponse getProduct(UUID productId) {
    Product product = productRepository.findPublishedProductForClient(
        productId,
        DEFAULT_RESTAURANT_ID
      )
      .orElseThrow(() -> new ProductNotFoundException(
        "Product not found with ID: " + productId
      ));

    return productMapper.toProductResponse(resolveProduct(product));
  }

  private ResolvedProduct resolveProduct(Product product) {
    ProductOptionResolutionContext context =
      resolutionService.prepareProductContext(product);

    List<ResolvedProductVariant> variants = product.getVariants() == null
      ? List.of()
      : product.getVariants().stream()
      .map(variant -> resolveVariant(context, variant))
      .toList();

    return new ResolvedProduct(product, variants);
  }


  private ResolvedProductVariant resolveVariant(
    ProductOptionResolutionContext context,
    ProductVariant variant
  ) {
    List<ResolvedOptionGroup> optionGroups =
      resolutionService.resolveAllForVariant(context, variant);

    return new ResolvedProductVariant(variant, optionGroups);
  }
}
