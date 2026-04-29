package com.restaurant.restaurantbackend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

  private final UserRepository userRepository;

  @Transactional
  public User getOrCreateCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
      throw new IllegalStateException("No authenticated Keycloak user found");
    }

    String keycloakId = jwt.getSubject();
    String email = jwt.getClaimAsString("email");
    String firstname = jwt.getClaimAsString("given_name");
    String lastname = jwt.getClaimAsString("family_name");

    return userRepository.findByKeycloakId(keycloakId)
      .map(existingUser -> updateUserIfNeeded(existingUser, email, firstname, lastname))
      .orElseGet(() -> createUser(keycloakId, email, firstname, lastname));
  }

  private User createUser(
    String keycloakId,
    String email,
    String firstname,
    String lastname
  ) {
    User user = User.builder()
      .keycloakId(keycloakId)
      .email(email)
      .firstname(firstname != null ? firstname : "")
      .lastname(lastname != null ? lastname : "")
      .enabled(true)
      .deleted(false)
      .build();

    return userRepository.save(user);
  }

  private User updateUserIfNeeded(
    User user,
    String email,
    String firstname,
    String lastname
  ) {
    boolean changed = false;

    if (email != null && !email.equals(user.getEmail())) {
      user.setEmail(email);
      changed = true;
    }

    if (firstname != null && !firstname.equals(user.getFirstname())) {
      user.setFirstname(firstname);
      changed = true;
    }

    if (lastname != null && !lastname.equals(user.getLastname())) {
      user.setLastname(lastname);
      changed = true;
    }

    return changed ? userRepository.save(user) : user;
  }
}
