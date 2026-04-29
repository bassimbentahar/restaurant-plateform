package com.restaurant.restaurantbackend.config;

import com.restaurant.restaurantbackend.config.audit.ApplicationAuditAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

@Configuration
public class BeanConfig {

  @Bean
  public AuditorAware<String> auditorAware(){
    return new ApplicationAuditAware();  }
}
