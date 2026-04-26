package com.restaurant.restaurantbackend.config.security;

import jakarta.validation.constraints.NotNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toSet;

public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

  private static final String CLIENT_ID = "client-app";

  private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter =
    new JwtGrantedAuthoritiesConverter();

  @Override
  public AbstractAuthenticationToken convert(@NotNull Jwt jwt) {
    Set<GrantedAuthority> authorities = Stream.concat(
      jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
      extractResourceRoles(jwt).stream()
    ).collect(toSet());

    return new JwtAuthenticationToken(jwt, authorities);
  }

  private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
    Map<String, Object> resourceAccess = jwt.getClaim("resource_access");

    if (resourceAccess == null || !resourceAccess.containsKey(CLIENT_ID)) {
      return Set.of();
    }

    Map<String, Object> clientAccess =
      (Map<String, Object>) resourceAccess.get(CLIENT_ID);

    Collection<String> roles =
      (Collection<String>) clientAccess.get("roles");

    if (roles == null) {
      return Set.of();
    }

    return roles.stream()
      .map(role -> new SimpleGrantedAuthority("ROLE_" + role.replace("-", "_").toUpperCase()))
      .collect(toSet());
  }
}
