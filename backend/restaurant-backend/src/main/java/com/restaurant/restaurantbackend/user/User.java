package com.restaurant.restaurantbackend.user;

import com.restaurant.restaurantbackend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

  @Column(name = "keycloak_id", unique = true, nullable = false)
  private String keycloakId; // correspond au "sub"(subject) du JWT

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String firstname;

  @Column(nullable = false)
  private String lastname;

  private LocalDate dateOfBirth;

  private String phone;

  @Builder.Default
  private boolean enabled = true;

  @Builder.Default
  private boolean deleted = false;

  // TODO :
  // @OneToMany(mappedBy = "user")
  // private List<Order> orders;

  public String getFullName() {
    return firstname + " " + lastname;
  }
}
