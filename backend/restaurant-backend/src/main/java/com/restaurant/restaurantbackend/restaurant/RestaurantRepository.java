package com.restaurant.restaurantbackend.restaurant;

import com.restaurant.restaurantbackend.restaurant.dto.NearbyRestaurantProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

  Optional<Restaurant> findBySlug(String slug);

  boolean existsBySlug(String slug);

  boolean existsBySlugAndIdNot(String slug, UUID id);

  List<Restaurant> findAllByActiveTrueOrderByNameAsc();

  @Query(value = """
  SELECT
    r.id AS id,
    r.name AS name,
    r.slug AS slug,
    r.description AS description,
    r.city AS city,
    r.latitude AS latitude,
    r.longitude AS longitude,
    r.is_open AS open,
    r.supports_delivery AS supportsDelivery,
    r.supports_pickup AS supportsPickup,
    r.average_rating AS averageRating,
    r.total_reviews AS totalReviews,
    ST_DistanceSphere(
      ST_MakePoint(r.longitude, r.latitude),
      ST_MakePoint(:lng, :lat)
    ) / 1000.0 AS distanceKm
  FROM restaurants r
  WHERE r.is_active = TRUE
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
    AND ST_DistanceSphere(
      ST_MakePoint(r.longitude, r.latitude),
      ST_MakePoint(:lng, :lat)
    ) <= :radiusMeters
  ORDER BY distanceKm ASC
  """, nativeQuery = true)
  List<NearbyRestaurantProjection> findNearbyRestaurantsProjection(
    @Param("lat") double lat,
    @Param("lng") double lng,
    @Param("radiusMeters") double radiusMeters
  );
}
