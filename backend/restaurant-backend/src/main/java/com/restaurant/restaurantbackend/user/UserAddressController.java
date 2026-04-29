package com.restaurant.restaurantbackend.user;

import com.restaurant.restaurantbackend.user.dto.UserAddressRequest;
import com.restaurant.restaurantbackend.user.dto.UserAddressResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me/addresses")
@RequiredArgsConstructor
public class UserAddressController {

  private final UserAddressService addressService;

  @GetMapping
  public List<UserAddressResponse> findMyAddresses(@AuthenticationPrincipal Jwt jwt) {
    return addressService.findMyAddresses(jwt);
  }

  @PostMapping
  public UserAddressResponse create(
    @AuthenticationPrincipal Jwt jwt,
    @RequestBody UserAddressRequest request
  ) {
    return addressService.create(jwt, request);
  }

  @PutMapping("/{id}")
  public UserAddressResponse update(
    @PathVariable UUID id,
    @AuthenticationPrincipal Jwt jwt,
    @RequestBody UserAddressRequest request
  ) {
    return addressService.update(id, jwt, request);
  }

  @PatchMapping("/{id}/default")
  public UserAddressResponse setDefault(
    @PathVariable UUID id,
    @AuthenticationPrincipal Jwt jwt
  ) {
    return addressService.setDefault(id, jwt);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(
    @PathVariable UUID id,
    @AuthenticationPrincipal Jwt jwt
  ) {
    addressService.delete(id, jwt);
  }
}
