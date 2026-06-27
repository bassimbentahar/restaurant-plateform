package com.restaurant.restaurantbackend.product.exception;

import java.util.List;
import java.util.UUID;

public class OptionGroupsNotFoundException extends RuntimeException{

  public OptionGroupsNotFoundException(List<UUID> ids){
    super("Option Group not found: " + ids);
  }
}
