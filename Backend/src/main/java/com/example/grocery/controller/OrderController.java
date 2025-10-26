package com.example.grocery.controller;

import com.example.grocery.model.Order;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.OrderRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
import com.example.grocery.repo.BakeryRepository;
import com.example.grocery.repo.FruitsRepository;
import com.example.grocery.repo.DairyRepository;
import com.example.grocery.repo.MeatRepository;
import com.example.grocery.repo.BeveragesRepository;
import com.example.grocery.repo.GrainsRepository;
import com.example.grocery.repo.VegetablesRepository;
import com.example.grocery.repo.ProductRepository;
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
    @Autowired
    private EmployeeRepository employeeRepo;
    @Autowired
    private BakeryRepository bakeryRepo;
    @Autowired
    private FruitsRepository fruitsRepo;
    @Autowired
    private DairyRepository dairyRepo;
    @Autowired
    private MeatRepository meatRepo;
    @Autowired
    private BeveragesRepository beveragesRepo;
    @Autowired
    private GrainsRepository grainsRepo;
    @Autowired
    private VegetablesRepository vegetablesRepo;
    @Autowired
    private ProductRepository productRepo;

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
        
        // Get payment method from request (default to "cash")
        String paymentMethod = (String) body.get("paymentMethod");
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            paymentMethod = "cash";
        }
        
        // ✅ NEW: Validate and reduce stock BEFORE creating order
        List<Map<String, Object>> stockErrors = new ArrayList<>();
        for (Map<String, Object> item : itemsRaw) {
            Number pid = (Number)item.get("productId");
            Number qty = (Number)item.get("quantity");
            String category = (String)item.get("category"); // Category from frontend
            
            if (pid == null || qty == null) continue;
            
            // Check stock availability
            boolean hasStock = checkStockAvailability(pid.longValue(), qty.intValue(), category);
            if (!hasStock) {
                String productName = getProductName(pid.longValue(), category);
                stockErrors.add(Map.of(
                    "productId", pid,
                    "productName", productName,
                    "requestedQuantity", qty,
                    "error", "Insufficient stock"
                ));
            }
        }
        
        // If any stock errors, return them
        if (!stockErrors.isEmpty()) {
            return Map.of(
                "error", "Insufficient stock for some items",
                "stockErrors", stockErrors
            );
        }
        
        Order o = new Order();
        o.setCustomer(u.get());
        o.setItems(items);
        o.setTotal(total);
        o.setDeliveryAddress(deliveryAddress);
        o.setPaymentMethod(paymentMethod);
        
        if ("bank".equalsIgnoreCase(paymentMethod)) {
            // Bank payment flow - order pending payment review
            String paymentReceipt = (String) body.get("paymentReceipt");
            if (paymentReceipt == null || paymentReceipt.trim().isEmpty()) {
                return Map.of("error", "Payment receipt is required for bank payment");
            }
            o.setPaymentReceipt(paymentReceipt);
            o.setPaymentStatus("pending");
            o.setStatus("PAYMENT_REVIEW");
            // No delivery employee assigned yet - will be assigned after payment approval
            System.out.println("[OrderController] Bank payment order created - pending review");
        } else {
            // Cash on delivery flow - existing logic
            Employee assignedEmployee = assignDeliveryEmployee();
            o.setStatus("PLACED");
            o.setDeliveryEmployee(assignedEmployee);
            o.setPaymentStatus("cash_on_delivery");
            String employeeName = assignedEmployee != null ? assignedEmployee.getName() : "No delivery employee available";
            System.out.println("[OrderController] Cash order assigned to delivery employee: " + employeeName);
        }
        
        orderRepo.save(o);
        
        // ✅ NEW: Reduce stock AFTER order is saved
        for (Map<String, Object> item : itemsRaw) {
            Number pid = (Number)item.get("productId");
            Number qty = (Number)item.get("quantity");
            String category = (String)item.get("category");
            
            if (pid != null && qty != null) {
                reduceStock(pid.longValue(), qty.intValue(), category);
                System.out.println("[OrderController] ✅ Reduced stock: Product ID " + pid + 
                                 " (" + category + "), Quantity: " + qty);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "order placed");
        response.put("orderId", o.getId());
        response.put("total", total);
        response.put("paymentMethod", paymentMethod);
        response.put("status", o.getStatus());
        
        if (o.getDeliveryEmployee() != null) {
            response.put("deliveryEmployee", o.getDeliveryEmployee().getName());
        }
        
        return response;
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
                o.getTotal(),
                o.getDeliveryEmployee() != null ? o.getDeliveryEmployee().getId() : null,
                o.getDeliveryEmployee() != null ? o.getDeliveryEmployee().getName() : "Not assigned"
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
            o.getTotal(),
            o.getDeliveryEmployee() != null ? o.getDeliveryEmployee().getId() : null,
            o.getDeliveryEmployee() != null ? o.getDeliveryEmployee().getName() : "Not assigned"
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

        /**
         * Get all orders for a specific customer
         * Used by CustomerOrderHistory component in frontend
         * No authentication required (customer viewing their own orders)
         * 
         * @param userId The customer's user ID
         * @return List of orders with full details including payment info
         */
        @GetMapping("/users/{userId}/orders")
        public Object getUserOrders(@PathVariable Long userId) {
            try {
                System.out.println("[OrderController] ═══════════════════════════════════");
                System.out.println("[OrderController] Getting orders for user ID: " + userId);
                
                // Verify user exists
                Optional<User> userOpt = userRepo.findById(userId);
                if (userOpt.isEmpty()) {
                    System.err.println("[OrderController] ❌ User not found: " + userId);
                    return Map.of("error", "User not found with ID: " + userId);
                }
                
                User user = userOpt.get();
                System.out.println("[OrderController] User found: " + user.getUsername());
                
                // Get all orders for this customer
                List<Order> orders = orderRepo.findByCustomer(user);
                System.out.println("[OrderController] Found " + orders.size() + " orders");
                
                // Convert to detailed DTOs
                List<Map<String, Object>> orderDTOs = new ArrayList<>();
                
                for (Order order : orders) {
                    Map<String, Object> dto = new HashMap<>();
                    
                    // Basic order info
                    dto.put("id", order.getId());
                    dto.put("status", order.getStatus());
                    dto.put("createdAt", order.getCreatedAt());
                    dto.put("deliveryAddress", order.getDeliveryAddress());
                    dto.put("total", order.getTotal());
                    dto.put("details", order.getDetails());
                    
                    // Customer info
                    dto.put("customerId", user.getId());
                    dto.put("customerName", user.getUsername());
                    dto.put("customerEmail", user.getEmail());
                    
                    // Delivery employee info
                    if (order.getDeliveryEmployee() != null) {
                        dto.put("deliveryEmployeeId", order.getDeliveryEmployee().getId());
                        dto.put("deliveryEmployeeName", order.getDeliveryEmployee().getName());
                    } else {
                        dto.put("deliveryEmployeeId", null);
                        dto.put("deliveryEmployeeName", null);
                    }
                    
                    // Payment info
                    dto.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "cash");
                    dto.put("paymentReceipt", order.getPaymentReceipt());
                    dto.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "cash_on_delivery");
                    
                    // Payment handler info
                    if (order.getPaymentHandler() != null) {
                        dto.put("paymentHandlerId", order.getPaymentHandler().getId());
                        dto.put("paymentHandlerName", order.getPaymentHandler().getName());
                    } else {
                        dto.put("paymentHandlerId", null);
                        dto.put("paymentHandlerName", null);
                    }
                    
                    // Items
                    dto.put("items", order.getItems());
                    
                    orderDTOs.add(dto);
                    
                    System.out.println("[OrderController]   - Order #" + order.getId() + 
                                     " | Status: " + order.getStatus() + 
                                     " | Payment: " + order.getPaymentMethod() + 
                                     " | Total: $" + order.getTotal());
                }
                
                System.out.println("[OrderController] ✅ Returning " + orderDTOs.size() + " orders");
                System.out.println("[OrderController] ═══════════════════════════════════");
                
                return orderDTOs;
                
            } catch (Exception e) {
                System.err.println("[OrderController] ❌ Error fetching user orders: " + e.getMessage());
                e.printStackTrace();
                return Map.of("error", "Failed to fetch orders: " + e.getMessage());
            }
        }

        /**
         * Automatically assigns a delivery employee to an order using round-robin algorithm
         * @return Employee assigned for delivery, or null if no delivery employees available
         */
        private Employee assignDeliveryEmployee() {
            // Get all delivery employees
            List<Employee> deliveryEmployees = employeeRepo.findByRoleIgnoreCase("Delivery");
            
            if (deliveryEmployees.isEmpty()) {
                System.out.println("[OrderController] Warning: No delivery employees found in system");
                return null;
            }
            
            // Sort delivery employees by ID to ensure consistent ordering
            deliveryEmployees.sort(Comparator.comparing(Employee::getId));
            
            // Count how many orders each delivery employee currently has
            Map<Long, Long> employeeOrderCount = new HashMap<>();
            for (Employee emp : deliveryEmployees) {
                long count = orderRepo.findAll().stream()
                    .filter(o -> o.getDeliveryEmployee() != null && 
                                 o.getDeliveryEmployee().getId().equals(emp.getId()))
                    .count();
                employeeOrderCount.put(emp.getId(), count);
            }
            
            // Find the delivery employee with the least orders
            Employee assignedEmployee = deliveryEmployees.stream()
                .min(Comparator.comparing(emp -> employeeOrderCount.getOrDefault(emp.getId(), 0L)))
                .orElse(deliveryEmployees.get(0)); // Fallback to first employee
            
            System.out.println("[OrderController] Available delivery employees: " + deliveryEmployees.size() + 
                             ", Assigning to: " + assignedEmployee.getName() + " (ID: " + assignedEmployee.getId() + 
                             "), Current orders: " + employeeOrderCount.getOrDefault(assignedEmployee.getId(), 0L));
            
            return assignedEmployee;
        }

        @PutMapping("/{id}/approve-payment")
    public Object approvePayment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            // Get employeeId from body (flexible - works with old frontend)
            Long employeeId = null;
            if (body != null && body.containsKey("employeeId")) {
                Object empObj = body.get("employeeId");
                if (empObj instanceof Number) {
                    employeeId = ((Number) empObj).longValue();
                } else if (empObj instanceof String) {
                    try {
                        employeeId = Long.parseLong((String) empObj);
                    } catch (NumberFormatException e) {
                        return Map.of("error", "Invalid employeeId format");
                    }
                }
            }
            
            // If no employeeId provided, use a default or skip validation
            // This makes it work with frontends that don't send employeeId
            if (employeeId == null) {
                // Option 1: Use default Payment Handler (ID 6 from your guide)
                employeeId = 6L;
            }

            Optional<Employee> employeeOpt = employeeRepo.findById(employeeId);
            if (employeeOpt.isEmpty()) return Map.of("error", "Employee not found");
            Employee employee = employeeOpt.get();
            if (!"Payment Handler".equalsIgnoreCase(employee.getRole())) return Map.of("error", "Only Payment Handler can approve");

            Optional<Order> orderOpt = orderRepo.findById(id);
            if (orderOpt.isEmpty()) return Map.of("error", "Order not found");
            Order order = orderOpt.get();
            if (!"PAYMENT_REVIEW".equals(order.getStatus())) return Map.of("error", "Order not pending review");

            order.setPaymentStatus("approved");
            order.setStatus("PLACED");
            order.setPaymentHandler(employee);
            order.setApprovedBy(employee.getId());
            order.setApprovedByName(employee.getName());
            order.setApprovedAt(new java.sql.Timestamp(System.currentTimeMillis()));

            Employee deliveryEmployee = assignDeliveryEmployee();
            order.setDeliveryEmployee(deliveryEmployee);
            orderRepo.save(order);

            return Map.of("success", true, "message", "Payment approved", "orderId", order.getId());
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    @PutMapping("/{id}/reject-payment")
    public Object rejectPayment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            // Get employeeId from body (flexible - works with old frontend)
            Long employeeId = null;
            if (body != null && body.containsKey("employeeId")) {
                Object empObj = body.get("employeeId");
                if (empObj instanceof Number) {
                    employeeId = ((Number) empObj).longValue();
                } else if (empObj instanceof String) {
                    try {
                        employeeId = Long.parseLong((String) empObj);
                    } catch (NumberFormatException e) {
                        return Map.of("error", "Invalid employeeId format");
                    }
                }
            }
            
            // If no employeeId provided, use default
            if (employeeId == null) {
                employeeId = 6L; // Default Payment Handler
            }

            Optional<Employee> employeeOpt = employeeRepo.findById(employeeId);
            if (employeeOpt.isEmpty()) return Map.of("error", "Employee not found");
            Employee employee = employeeOpt.get();
            if (!"Payment Handler".equalsIgnoreCase(employee.getRole())) return Map.of("error", "Only Payment Handler can reject");

            String reason = body != null ? (String) body.get("rejectionReason") : null;
            if (reason == null || reason.trim().isEmpty()) {
                reason = body != null ? (String) body.get("reason") : null; // Try alternate field name
            }
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Payment verification failed"; // Default reason
            }

            Optional<Order> orderOpt = orderRepo.findById(id);
            if (orderOpt.isEmpty()) return Map.of("error", "Order not found");
            Order order = orderOpt.get();
            if (!"PAYMENT_REVIEW".equals(order.getStatus())) return Map.of("error", "Order not pending review");

            order.setPaymentStatus("rejected");
            order.setStatus("CANCELLED");
            order.setPaymentHandler(employee);
            order.setRejectedBy(employee.getId());
            order.setRejectedByName(employee.getName());
            order.setRejectionReason(reason);
            order.setRejectedAt(new java.sql.Timestamp(System.currentTimeMillis()));
            orderRepo.save(order);

            return Map.of("success", true, "message", "Payment rejected", "orderId", order.getId());
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }
    
    /**
     * Mark an order as delivered
     * Used by delivery employees to mark orders as delivered
     * 
     * @param orderId The order ID to mark as delivered
     * @param employeeId The employee ID from header
     * @param body Request body containing employeeId for validation
     * @return Success response with updated order details
     */
    @PutMapping("/{orderId}/mark-delivered")
    public Object markOrderAsDelivered(
            @PathVariable Long orderId,
            @RequestHeader("user-id") Long employeeId,
            @RequestBody Map<String, Object> body) {
        
        try {
            System.out.println("[OrderController] ═══════════════════════════════════");
            System.out.println("[OrderController] Mark as Delivered Request");
            System.out.println("[OrderController] Order ID: " + orderId);
            System.out.println("[OrderController] Employee ID: " + employeeId);
            
            // Get order from database
            Optional<Order> orderOpt = orderRepo.findById(orderId);
            if (orderOpt.isEmpty()) {
                System.err.println("[OrderController] ❌ Order not found: " + orderId);
                return Map.of(
                    "error", "Order not found",
                    "orderId", orderId
                );
            }
            
            Order order = orderOpt.get();
            
            // Validate employee is assigned to this order
            if (order.getDeliveryEmployee() == null || 
                !order.getDeliveryEmployee().getId().equals(employeeId)) {
                System.err.println("[OrderController] ❌ Employee not assigned to order");
                System.err.println("[OrderController] Assigned: " + 
                    (order.getDeliveryEmployee() != null ? order.getDeliveryEmployee().getId() : "None"));
                System.err.println("[OrderController] Requesting: " + employeeId);
                return Map.of(
                    "error", "You are not assigned to this order",
                    "assignedEmployee", order.getDeliveryEmployee() != null ? 
                        order.getDeliveryEmployee().getId() : null,
                    "requestingEmployee", employeeId
                );
            }
            
            // Check if order is already delivered
            if ("DELIVERED".equalsIgnoreCase(order.getStatus())) {
                System.out.println("[OrderController] ⚠️ Order already delivered");
                return Map.of(
                    "error", "Order is already delivered",
                    "currentStatus", order.getStatus(),
                    "orderId", orderId
                );
            }
            
            // Check if order is in valid status for delivery (PLACED)
            if (!"PLACED".equalsIgnoreCase(order.getStatus())) {
                System.err.println("[OrderController] ❌ Invalid status for delivery: " + order.getStatus());
                return Map.of(
                    "error", "Order cannot be marked as delivered in current status",
                    "currentStatus", order.getStatus(),
                    "orderId", orderId
                );
            }
            
            // Update order status to DELIVERED
            String oldStatus = order.getStatus();
            order.setStatus("DELIVERED");
            
            // Save updated order
            Order updatedOrder = orderRepo.save(order);
            
            System.out.println("[OrderController] ✅ Order marked as delivered successfully");
            System.out.println("[OrderController] Order #" + orderId + ": " + oldStatus + " → DELIVERED");
            System.out.println("[OrderController] Delivered by: " + order.getDeliveryEmployee().getName());
            System.out.println("[OrderController] ═══════════════════════════════════");
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order marked as delivered successfully");
            response.put("orderId", updatedOrder.getId());
            response.put("status", updatedOrder.getStatus());
            response.put("deliveredBy", employeeId);
            response.put("deliveredByName", order.getDeliveryEmployee().getName());
            response.put("deliveredAt", new java.sql.Timestamp(System.currentTimeMillis()));
            
            return response;
            
        } catch (Exception e) {
            System.err.println("[OrderController] ❌ Error marking order as delivered: " + e.getMessage());
            e.printStackTrace();
            return Map.of(
                "error", "Failed to mark order as delivered",
                "details", e.getMessage(),
                "orderId", orderId
            );
        }
    }
    
    /**
     * Check if sufficient stock is available for a product
     * @param productId The product ID
     * @param quantity The requested quantity
     * @param category The product category (bakery, fruits, dairy, etc.)
     * @return true if stock is available, false otherwise
     */
    private boolean checkStockAvailability(Long productId, int quantity, String category) {
        try {
            if (category == null || category.trim().isEmpty()) {
                // Try to find in all categories
                return checkStockInAllCategories(productId, quantity);
            }
            
            String categoryLower = category.toLowerCase().trim();
            
            switch (categoryLower) {
                case "bakery":
                    return bakeryRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                case "fruits":
                    return fruitsRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                case "dairy":
                    return dairyRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                case "meat":
                    return meatRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                case "beverages":
                    return beveragesRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                case "grains":
                    return grainsRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                case "vegetables":
                    return vegetablesRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                case "products":
                    return productRepo.findById(productId)
                        .map(p -> p.getQuantity() >= quantity)
                        .orElse(false);
                        
                default:
                    System.err.println("[OrderController] Unknown category: " + category);
                    return false;
            }
        } catch (Exception e) {
            System.err.println("[OrderController] Error checking stock: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Reduce stock quantity for a product
     * @param productId The product ID
     * @param quantity The quantity to reduce
     * @param category The product category
     */
    private void reduceStock(Long productId, int quantity, String category) {
        try {
            if (category == null || category.trim().isEmpty()) {
                // Try to reduce in all categories
                reduceStockInAllCategories(productId, quantity);
                return;
            }
            
            String categoryLower = category.toLowerCase().trim();
            
            switch (categoryLower) {
                case "bakery":
                    bakeryRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        bakeryRepo.save(p);
                    });
                    break;
                    
                case "fruits":
                    fruitsRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        fruitsRepo.save(p);
                    });
                    break;
                    
                case "dairy":
                    dairyRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        dairyRepo.save(p);
                    });
                    break;
                    
                case "meat":
                    meatRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        meatRepo.save(p);
                    });
                    break;
                    
                case "beverages":
                    beveragesRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        beveragesRepo.save(p);
                    });
                    break;
                    
                case "grains":
                    grainsRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        grainsRepo.save(p);
                    });
                    break;
                    
                case "vegetables":
                    vegetablesRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        vegetablesRepo.save(p);
                    });
                    break;
                    
                case "products":
                    productRepo.findById(productId).ifPresent(p -> {
                        p.setQuantity(p.getQuantity() - quantity);
                        productRepo.save(p);
                    });
                    break;
                    
                default:
                    System.err.println("[OrderController] Cannot reduce stock - unknown category: " + category);
            }
        } catch (Exception e) {
            System.err.println("[OrderController] Error reducing stock: " + e.getMessage());
        }
    }
    
    /**
     * Get product name for error messages
     * @param productId The product ID
     * @param category The product category
     * @return Product name or "Unknown Product"
     */
    private String getProductName(Long productId, String category) {
        try {
            if (category == null || category.trim().isEmpty()) {
                return "Unknown Product";
            }
            
            String categoryLower = category.toLowerCase().trim();
            
            switch (categoryLower) {
                case "bakery":
                    return bakeryRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                case "fruits":
                    return fruitsRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                case "dairy":
                    return dairyRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                case "meat":
                    return meatRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                case "beverages":
                    return beveragesRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                case "grains":
                    return grainsRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                case "vegetables":
                    return vegetablesRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                case "products":
                    return productRepo.findById(productId).map(p -> p.getName()).orElse("Unknown Product");
                default:
                    return "Unknown Product";
            }
        } catch (Exception e) {
            return "Unknown Product";
        }
    }
    
    /**
     * Fallback: Check stock in all categories if category not specified
     */
    private boolean checkStockInAllCategories(Long productId, int quantity) {
        // Try each repository
        if (bakeryRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        if (fruitsRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        if (dairyRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        if (meatRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        if (beveragesRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        if (grainsRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        if (vegetablesRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        if (productRepo.findById(productId).map(p -> p.getQuantity() >= quantity).orElse(false)) return true;
        return false;
    }
    
    /**
     * Fallback: Reduce stock in all categories if category not specified
     */
    private void reduceStockInAllCategories(Long productId, int quantity) {
        // Try each repository
        bakeryRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            bakeryRepo.save(p);
        });
        fruitsRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            fruitsRepo.save(p);
        });
        dairyRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            dairyRepo.save(p);
        });
        meatRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            meatRepo.save(p);
        });
        beveragesRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            beveragesRepo.save(p);
        });
        grainsRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            grainsRepo.save(p);
        });
        vegetablesRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            vegetablesRepo.save(p);
        });
        productRepo.findById(productId).ifPresent(p -> {
            p.setQuantity(p.getQuantity() - quantity);
            productRepo.save(p);
        });
    }
}
