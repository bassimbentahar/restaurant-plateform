package com.restaurant.restaurantbackend.user;

import com.restaurant.restaurantbackend.user.dto.UserRequest;
import com.restaurant.restaurantbackend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
public class UserController {

  private final CurrentUserService service;
  private final UserMapper mapper;

  @GetMapping("/me")
  public UserResponse me() {
    User user = service.getOrCreateCurrentUser();
    return mapper.toResponse(user);
  }

  @PutMapping("/me")
  public UserResponse update(
    @RequestBody UserRequest request
  ) {
    User user = service.getOrCreateCurrentUser();
    mapper.update(user, request);
    return mapper.toResponse(user);
  }
}
