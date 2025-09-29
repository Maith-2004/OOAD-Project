package com.example.grocery.controller;

import com.example.grocery.model.Order;
import com.example.grocery.model.User;
import com.example.grocery.repo.OrderRepository;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderRepository orderRepo;
    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public Object placeOrder(@RequestBody Map<String,Object> body){
        Number cid = (Number)body.get("customerId");
        if(cid==null) return Map.of("error","customerId required");
        Optional<User> u = userRepo.findById(cid.longValue());
        if(u.isEmpty()) return Map.of("error","user not found");
        List<Map<String,Object>> itemsRaw = (List<Map<String,Object>>)body.get("items");
        if(itemsRaw==null || itemsRaw.isEmpty()) return Map.of("error","items required");
        List<com.example.grocery.model.OrderItem> items = new ArrayList<>();
        double total = 0;
        for(Map<String,Object> item : itemsRaw) {
            Number pid = (Number)item.get("productId");
            Number qty = (Number)item.get("quantity");
            Number price = (Number)item.get("price");
            if(pid==null || qty==null || price==null) continue;
            com.example.grocery.model.OrderItem oi = new com.example.grocery.model.OrderItem();
            oi.setProduct(new com.example.grocery.model.Product());
            oi.getProduct().setId(pid.longValue());
            oi.setQuantity(qty.intValue());
            oi.setPrice(price.doubleValue());
            total += price.doubleValue() * qty.intValue();
            items.add(oi);
        }
        // Use delivery_address from request if provided, else use user's address if requested
        String useSavedAddress = (String) body.get("useSavedAddress"); // "yes" or "no"
        String deliveryAddress = (String) body.get("delivery_address");
        if ("yes".equalsIgnoreCase(useSavedAddress)) {
            deliveryAddress = u.get().getAddress();
            System.out.println("[OrderController] Using user's saved address: " + deliveryAddress);
        } else if (deliveryAddress != null && !deliveryAddress.trim().isEmpty()) {
            System.out.println("[OrderController] Using provided delivery address: " + deliveryAddress);
        }
        if (deliveryAddress == null || deliveryAddress.trim().isEmpty()) {
            return Map.of("error", "No delivery address found. Please provide a delivery address.");
        }
        System.out.println("[OrderController] Saving order with delivery address: " + deliveryAddress);
        Order o = new Order();
        o.setCustomer(u.get());
        o.setItems(items);
        o.setTotal(total);
        o.setStatus("PLACED");
        o.setDeliveryAddress(deliveryAddress);
        orderRepo.save(o);
        return Map.of("message","order placed","orderId",o.getId(),"total",total);
    }

    @GetMapping
    public Object all(@RequestHeader("user-id") Long userId) {
        Optional<User> managerOpt = userRepo.findById(userId);
        if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
            return Map.of("error", "Only manager can view all orders");
        }
        List<Order> orders = orderRepo.findAll();
        List<com.example.grocery.dto.OrderDTO> dtos = new ArrayList<>();
        for (Order o : orders) {
            dtos.add(new com.example.grocery.dto.OrderDTO(
                o.getId(),
                o.getCustomer() != null ? o.getCustomer().getId() : null,
                o.getStatus(),
                o.getCreatedAt(),
                o.getDetails(),
                o.getDeliveryAddress(),
                o.getItems(),
                o.getTotal()
            ));
        }
        return dtos;
    }

    @GetMapping("/{id}")
    public Object getOrder(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> managerOpt = userRepo.findById(userId);
        if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
            return Map.of("error", "Only manager can view order details");
        }
        Optional<Order> orderOpt = orderRepo.findById(id);
        if (orderOpt.isEmpty()) {
            return Map.of("error", "Order not found");
        }
        Order o = orderOpt.get();
        return new com.example.grocery.dto.OrderDTO(
            o.getId(),
            o.getCustomer() != null ? o.getCustomer().getId() : null,
            o.getStatus(),
            o.getCreatedAt(),
            o.getDetails(),
            o.getDeliveryAddress(),
            o.getItems(),
            o.getTotal()
        );
    }

        @PutMapping("/{id}")
        public Object updateOrder(@PathVariable Long id, @RequestBody Map<String, Object> body, @RequestHeader("user-id") Long userId) {
            Optional<User> managerOpt = userRepo.findById(userId);
            if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
                return Map.of("error", "Only manager can update orders");
            }
            Optional<Order> orderOpt = orderRepo.findById(id);
            if (orderOpt.isEmpty()) {
                return Map.of("error", "Order not found");
            }
            Order o = orderOpt.get();
            if (body.containsKey("status")) o.setStatus((String) body.get("status"));
            if (body.containsKey("deliveryAddress")) o.setDeliveryAddress((String) body.get("deliveryAddress"));
            return orderRepo.save(o);
        }

        @DeleteMapping("/{id}")
        public Object deleteOrder(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
            Optional<User> managerOpt = userRepo.findById(userId);
            if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
                return Map.of("error", "Only manager can delete orders");
            }
            orderRepo.deleteById(id);
            return Map.of("status", "deleted");
        }
}
