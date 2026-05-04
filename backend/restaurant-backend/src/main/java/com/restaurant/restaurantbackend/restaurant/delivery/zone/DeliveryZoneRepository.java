package com.restaurant.restaurantbackend.restaurant.delivery.zone;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryZoneRepository extends JpaRepository<DeliveryZone, UUID> {

  List<DeliveryZone> findByRestaurantIdOrderByNameAsc(UUID restaurantId);

  @Query(value = """
  SELECT *
  FROM delivery_zones dz
  WHERE dz.restaurant_id = :restaurantId
    AND dz.enabled = true
    AND ST_Contains(
      dz.area,
      ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
    )
  LIMIT 1
""", nativeQuery = true)
  Optional<DeliveryZone> findZoneContainingPoint(
    @Param("restaurantId") UUID restaurantId,
    @Param("lat") double lat,
    @Param("lng") double lng
  );
}
