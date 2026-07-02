package com.restaurant.restaurantbackend.product.image;

import com.restaurant.restaurantbackend.product.image.dto.ProductImageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.images.storage", havingValue = "local")
public class LocalProductImageStorage implements ProductImageStorage {

  private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024;

  private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
    "image/jpeg",
    "image/png",
    "image/webp"
  );

  private final ProductImageStorageProperties properties;

  @Override
  public ProductImageUploadResponse store(MultipartFile file) {
    validate(file);

    String contentType = file.getContentType();
    String extension = extensionFor(contentType);
    String filename = UUID.randomUUID() + extension;

    String prefix = normalizePrefix(properties.productPrefix());
    String path = prefix + "/" + filename;

    Path rootPath = Path.of(properties.local().rootPath())
      .toAbsolutePath()
      .normalize();

    Path target = rootPath.resolve(path).normalize();

    if (!target.startsWith(rootPath)) {
      throw new IllegalArgumentException("Invalid image path");
    }

    try {
      Files.createDirectories(target.getParent());
      file.transferTo(target);

      return new ProductImageUploadResponse(
        path,
        buildPublicUrl(path),
        filename,
        contentType,
        file.getSize()
      );
    } catch (IOException exception) {
      throw new IllegalStateException("Unable to store product image", exception);
    }
  }

  @Override
  public void delete(String path) {
    if (path == null || path.isBlank()) {
      return;
    }

    String normalizedPath = path.replaceFirst("^/+", "");

    Path rootPath = Path.of(properties.local().rootPath())
      .toAbsolutePath()
      .normalize();

    Path target = rootPath.resolve(normalizedPath).normalize();

    if (!target.startsWith(rootPath)) {
      throw new IllegalArgumentException("Invalid image path");
    }

    try {
      Files.deleteIfExists(target);
    } catch (IOException exception) {
      throw new IllegalStateException("Unable to delete product image", exception);
    }
  }

  private void validate(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Image file is required");
    }

    if (file.getSize() > MAX_SIZE_BYTES) {
      throw new IllegalArgumentException("Image file is too large");
    }

    String contentType = file.getContentType();

    if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
      throw new IllegalArgumentException("Unsupported image type: " + contentType);
    }
  }

  private String extensionFor(String contentType) {
    return switch (contentType) {
      case "image/jpeg" -> ".jpg";
      case "image/png" -> ".png";
      case "image/webp" -> ".webp";
      default -> throw new IllegalArgumentException("Unsupported image type");
    };
  }

  private String normalizePrefix(String prefix) {
    if (prefix == null || prefix.isBlank()) {
      return "products";
    }

    return prefix.replaceAll("^/+", "").replaceAll("/+$", "");
  }

  private String buildPublicUrl(String path) {
    return properties.publicBaseUrl().replaceAll("/+$", "") + "/" + path;
  }
}
