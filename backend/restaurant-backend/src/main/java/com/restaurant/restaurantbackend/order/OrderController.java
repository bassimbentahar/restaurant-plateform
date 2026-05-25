package com.restaurant.restaurantbackend.order;

import com.restaurant.restaurantbackend.order.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  @PostMapping
  public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
    return orderService.createOrder(request);
  }

  @GetMapping("/me")
  public List<OrderResponse> findMyOrders() {
    return orderService.findMyOrders();
  }

  @GetMapping("/{id}")
  public OrderResponse findById(@PathVariable UUID id) {
    return orderService.findById(id);
  }

  @PatchMapping("/{id}/status")
  public OrderResponse updateStatus(
    @PathVariable UUID id,
    @Valid @RequestBody UpdateOrderStatusRequest request
  ) {
    return orderService.updateStatus(id, request.status());
  }
}
