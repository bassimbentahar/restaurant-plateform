package com.restaurant.restaurantbackend.product.handler;


import com.restaurant.restaurantbackend.product.exception.ProductNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
@ControllerAdvice
public class ProductExceptionHandler {

  @ExceptionHandler(ProductNotFoundException.class)
  public ResponseEntity<String> handleProductNotFound(ProductNotFoundException exception){
    return ResponseEntity.status(BAD_REQUEST).body(exception.getMessage());
  }
}
