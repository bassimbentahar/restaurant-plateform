package com.restaurant.restaurantbackend.user;

import com.restaurant.restaurantbackend.user.dto.UserAddressRequest;
import com.restaurant.restaurantbackend.user.dto.UserAddressResponse;
import org.springframework.stereotype.Component;

@Component
public class UserAddressMapper {

  public UserAddressResponse toResponse(UserAddress address) {
    return new UserAddressResponse(
      address.getId(),
      address.getLabel(),
      address.getStreet(),
      address.getStreetNumber(),
      address.getPostalCode(),
      address.getCity(),
      address.getCountry(),
      address.getInstructions(),
      address.isDefaultAddress()
    );
  }

  public void update(UserAddress address, UserAddressRequest request) {
    address.setLabel(request.label());
    address.setStreet(request.street());
    address.setStreetNumber(request.streetNumber());
    address.setPostalCode(request.postalCode());
    address.setCity(request.city());
    address.setCountry(request.country() != null ? request.country() : "Switzerland");
    address.setInstructions(request.instructions());
    address.setDefaultAddress(request.defaultAddress());
  }
}
