package com.restaurant.restaurantbackend.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

  Optional<Product> findByIdAndRestaurantId(UUID id, UUID restaurantId);

  @Query("""
    select count(product) > 0
    from Product product
    where product.restaurant.id = :restaurantId
      and product.slug = :slug
  """)
  boolean existsByRestaurantIdAndSlug(
    @Param("restaurantId") UUID restaurantId,
    @Param("slug") String slug
  );

  @Query("""
    select product
    from Product product
    where product.restaurant.id = :restaurantId
      and product.status = 'PUBLISHED'
      and product.isAvailable = true
      and product.isArchived = false
    order by product.title asc
  """)
  List<Product> findPublishedProductsForClient(
    @Param("restaurantId") UUID restaurantId
  );

  @Query("""
    select product
    from Product product
    where product.id = :productId
      and product.restaurant.id = :restaurantId
      and product.status = 'PUBLISHED'
      and product.isAvailable = true
      and product.isArchived = false
  """)
  Optional<Product> findPublishedProductForClient(
    @Param("productId") UUID productId,
    @Param("restaurantId") UUID restaurantId
  );

  @Query("""
    select product
    from Product product
    where product.restaurant.id = :restaurantId
      and product.status <> 'ARCHIVED'
    order by product.lastModifiedDate desc
  """)
  List<Product> findProductsForAdmin(
    @Param("restaurantId") UUID restaurantId
  );

  @Query("""
    select product
    from Product product
    where product.restaurant.id = :restaurantId
      and product.status = :status
    order by product.lastModifiedDate desc
  """)
  List<Product> findProductsForAdminByStatus(
    @Param("restaurantId") UUID restaurantId,
    @Param("status") ProductStatus status
  );
}
