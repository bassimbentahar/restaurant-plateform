package com.restaurant.restaurantbackend.user;

import com.restaurant.restaurantbackend.user.dto.UserAddressRequest;
import com.restaurant.restaurantbackend.user.dto.UserAddressResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserAddressService {

  private final UserAddressRepository addressRepository;
  private final CurrentUserService currentUserService;
  private final UserAddressMapper mapper;

  @Transactional(readOnly = true)
  public List<UserAddressResponse> findMyAddresses(Jwt jwt) {
    User user = currentUserService.getOrCreateCurrentUser();

    return addressRepository.findAllByUserId(user.getId())
      .stream()
      .map(mapper::toResponse)
      .toList();
  }

  @Transactional
  public UserAddressResponse create(Jwt jwt, UserAddressRequest request) {
    User user = currentUserService.getOrCreateCurrentUser();

    if (addressRepository.existsByUserIdAndLabelIgnoreCase(user.getId(), request.label())) {
      throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "Une adresse avec ce nom existe déjà"
      );
    }

    if (request.label() == null || request.label().isBlank()) {
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Le nom de l'adresse est obligatoire"
      );
    }

    if (addressRepository.existsByUserIdAndStreetIgnoreCaseAndStreetNumberIgnoreCaseAndPostalCodeAndCityIgnoreCase(
      user.getId(),
      request.street(),
      request.streetNumber(),
      request.postalCode(),
      request.city()
    )) {
      throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "Cette adresse existe déjà"
      );
    }

    if (request.defaultAddress()) {
      unsetDefaultAddress(user.getId());
    }

    UserAddress address = UserAddress.builder()
      .user(user)
      .label(request.label())
      .street(request.street())
      .streetNumber(request.streetNumber())
      .postalCode(request.postalCode())
      .city(request.city())
      .country(request.country() != null ? request.country() : "Switzerland")
      .instructions(request.instructions())
      .defaultAddress(request.defaultAddress())
      .build();

    return mapper.toResponse(addressRepository.save(address));
  }

  @Transactional
  public UserAddressResponse update(UUID addressId, Jwt jwt, UserAddressRequest request) {
    User user = currentUserService.getOrCreateCurrentUser();
    if (addressRepository.existsByUserIdAndLabelIgnoreCaseAndIdNot(
      user.getId(),
      request.label(),
      addressId
    )) {
      throw new RuntimeException("Une adresse avec ce nom existe déjà");
    }
    if (addressRepository.existsByUserIdAndStreetIgnoreCaseAndStreetNumberIgnoreCaseAndPostalCodeAndCityIgnoreCaseAndIdNot(
      user.getId(),
      request.street(),
      request.streetNumber(),
      request.postalCode(),
      request.city(),
      addressId
    )) {
      throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "Cette adresse existe déjà"
      );
    }

    UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
      .orElseThrow(() -> new RuntimeException("Address not found"));

    if (request.defaultAddress()) {
      unsetDefaultAddress(user.getId());
    }

    mapper.update(address, request);
    return mapper.toResponse(addressRepository.save(address));
  }

  @Transactional
  public void delete(UUID addressId, Jwt jwt) {
    User user = currentUserService.getOrCreateCurrentUser();

    UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
      .orElseThrow(() -> new RuntimeException("Address not found"));

    addressRepository.delete(address);
  }

  @Transactional
  public UserAddressResponse setDefault(UUID addressId, Jwt jwt) {
    User user = currentUserService.getOrCreateCurrentUser();

    UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
      .orElseThrow(() -> new RuntimeException("Address not found"));

    unsetDefaultAddress(user.getId());
    address.setDefaultAddress(true);

    return mapper.toResponse(addressRepository.save(address));
  }

  private void unsetDefaultAddress(UUID userId) {
    addressRepository.findAllByUserId(userId)
      .forEach(address -> address.setDefaultAddress(false));
  }

}
