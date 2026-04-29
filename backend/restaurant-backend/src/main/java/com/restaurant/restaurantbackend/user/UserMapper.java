package com.restaurant.restaurantbackend.user;

import com.restaurant.restaurantbackend.user.dto.UserRequest;
import com.restaurant.restaurantbackend.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

  public UserResponse toResponse(User user) {
    return new UserResponse(
      user.getId(),
      user.getKeycloakId(),
      user.getEmail(),
      user.getFirstname(),
      user.getLastname(),
      user.getFullName(),
      user.getDateOfBirth(),
      user.getPhone(),
      user.isEnabled(),
      user.isDeleted(),
      user.getCreatedDate(),
      user.getLastModifiedDate()
    );
  }

  public void update(User user, UserRequest request) {
    if (request.firstname() != null) {
      user.setFirstname(request.firstname());
    }
    if (request.lastname() != null) {
      user.setLastname(request.lastname());
    }
    if (request.dateOfBirth() != null) {
      user.setDateOfBirth(request.dateOfBirth());
    }
    if (request.phone() != null) {
      user.setPhone(request.phone());
    }
  }
}
