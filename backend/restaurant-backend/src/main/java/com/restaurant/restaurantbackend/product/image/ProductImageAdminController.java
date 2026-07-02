package com.restaurant.restaurantbackend.product.image;

import com.restaurant.restaurantbackend.product.image.dto.ProductImageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/product-images")
public class ProductImageAdminController {

  private final ProductImageStorage productImageStorage;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ProductImageUploadResponse> upload(
    @RequestParam("file") MultipartFile file
  ) {
    return ResponseEntity.ok(productImageStorage.store(file));
  }

  @DeleteMapping
  public ResponseEntity<Void> delete(@RequestParam String path) {
    productImageStorage.delete(path);

    return ResponseEntity.noContent().build();
  }
}
