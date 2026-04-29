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
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toSet;

public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

  private final JwtGrantedAuthoritiesConverter defaultConverter =
    new JwtGrantedAuthoritiesConverter();

  @Override
  public AbstractAuthenticationToken convert(Jwt jwt) {

    Set<GrantedAuthority> authorities = new HashSet<>();

    // Roles realm
    Map<String, Object> realmAccess = jwt.getClaim("realm_access");

    if (realmAccess != null && realmAccess.containsKey("roles")) {
      Collection<String> roles = (Collection<String>) realmAccess.get("roles");

      roles.forEach(role ->
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role))
      );
    }

    // scopes standards (optionnel)
    authorities.addAll(defaultConverter.convert(jwt));

    return new JwtAuthenticationToken(jwt, authorities);
  }
}
