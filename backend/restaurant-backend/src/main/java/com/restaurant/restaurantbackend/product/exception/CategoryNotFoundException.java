package com.restaurant.restaurantbackend.product.exception;

public class CategoryNotFoundException extends RuntimeException {
  public CategoryNotFoundException(String message){
    super(message);
  }
}
