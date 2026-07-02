package com.restaurant.restaurantbackend.product.image;


import com.restaurant.restaurantbackend.product.image.dto.ProductImageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ProductImageStorage {
  ProductImageUploadResponse store(MultipartFile file);

  void delete(String path);
}
