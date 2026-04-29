package com.restaurant.restaurantbackend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAddressRepository extends JpaRepository<UserAddress, UUID> {

  List<UserAddress> findAllByUserId(UUID userId);

  Optional<UserAddress> findByIdAndUserId(UUID id, UUID userId);

  boolean existsByUserIdAndLabelIgnoreCase(UUID userId, String label);

  boolean existsByUserIdAndLabelIgnoreCaseAndIdNot(UUID userId, String label, UUID id);

  boolean existsByUserIdAndStreetIgnoreCaseAndStreetNumberIgnoreCaseAndPostalCodeAndCityIgnoreCase(
    UUID userId,
    String street,
    String streetNumber,
    String postalCode,
    String city
  );

  boolean existsByUserIdAndStreetIgnoreCaseAndStreetNumberIgnoreCaseAndPostalCodeAndCityIgnoreCaseAndIdNot(
    UUID userId,
    String street,
    String streetNumber,
    String postalCode,
    String city,
    UUID id
  );
}
