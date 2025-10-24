package com.example.grocery.controller;

import com.example.grocery.model.Order;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.OrderRepository;
import com.example.grocery.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private EmployeeRepository employeeRepo;

    /**
     * GET /api/payments/pending
     * Get all orders pending payment review
     * For Payment Handler employees only
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingPayments(@RequestHeader("user-id") Long employeeId) {
        try {
            // Verify the user is a Payment Handler employee
            Optional<Employee> employeeOpt = employeeRepo.findById(employeeId);
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Employee not found"));
            }

            Employee employee = employeeOpt.get();
            if (!"Payment Handler".equalsIgnoreCase(employee.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Payment Handler employees can view pending payments"));
            }

            // Get all orders with status "PAYMENT_REVIEW" and payment method "bank"
            List<Order> allOrders = orderRepo.findAll();
            List<Map<String, Object>> pendingPayments = allOrders.stream()
                    .filter(o -> "PAYMENT_REVIEW".equals(o.getStatus()) && "bank".equalsIgnoreCase(o.getPaymentMethod()))
                    .map(this::convertOrderToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(pendingPayments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch pending payments: " + e.getMessage()));
        }
    }

    /**
     * POST /api/payments/approve/:orderId
     * Approve a bank payment
     */
    @PostMapping("/approve/{orderId}")
    public ResponseEntity<?> approvePayment(
            @PathVariable Long orderId,
            @RequestHeader("user-id") Long employeeId) {
        try {
            // Verify the user is a Payment Handler employee
            Optional<Employee> employeeOpt = employeeRepo.findById(employeeId);
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Employee not found"));
            }

            Employee employee = employeeOpt.get();
            if (!"Payment Handler".equalsIgnoreCase(employee.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Payment Handler employees can approve payments"));
            }

            // Get the order
            Optional<Order> orderOpt = orderRepo.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }

            Order order = orderOpt.get();

            // Verify order is in correct state
            if (!"PAYMENT_REVIEW".equals(order.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Order is not pending payment review"));
            }

            // Approve the payment
            order.setPaymentStatus("approved");
            order.setStatus("PLACED");
            order.setPaymentHandler(employee);
            order.setApprovedBy(employee.getId());
            order.setApprovedByName(employee.getName());
            order.setApprovedAt(new java.sql.Timestamp(System.currentTimeMillis()));

            // Assign a delivery employee
            Employee deliveryEmployee = assignDeliveryEmployee();
            order.setDeliveryEmployee(deliveryEmployee);

            orderRepo.save(order);

            System.out.println("[PaymentController] Payment approved by: " + employee.getName() +
                    ", Order assigned to delivery employee: " + 
                    (deliveryEmployee != null ? deliveryEmployee.getName() : "None"));

            return ResponseEntity.ok(Map.of(
                    "message", "Payment approved successfully",
                    "orderId", order.getId(),
                    "status", order.getStatus(),
                    "deliveryEmployee", deliveryEmployee != null ? deliveryEmployee.getName() : "None"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to approve payment: " + e.getMessage()));
        }
    }

    /**
     * POST /api/payments/reject/:orderId
     * Reject a bank payment
     */
    @PostMapping("/reject/{orderId}")
    public ResponseEntity<?> rejectPayment(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body,
            @RequestHeader("user-id") Long employeeId) {
        try {
            // Verify the user is a Payment Handler employee
            Optional<Employee> employeeOpt = employeeRepo.findById(employeeId);
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Employee not found"));
            }

            Employee employee = employeeOpt.get();
            if (!"Payment Handler".equalsIgnoreCase(employee.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Payment Handler employees can reject payments"));
            }

            // Get the order
            Optional<Order> orderOpt = orderRepo.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }

            Order order = orderOpt.get();

            // Verify order is in correct state
            if (!"PAYMENT_REVIEW".equals(order.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Order is not pending payment review"));
            }

            // Reject the payment
            String reason = body.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Payment verification failed";
            }

            order.setPaymentStatus("rejected");
            order.setStatus("CANCELLED");
            order.setDetails(order.getDetails() != null ? 
                    order.getDetails() + " | Rejection reason: " + reason : 
                    "Rejection reason: " + reason);
            order.setPaymentHandler(employee);
            order.setRejectedBy(employee.getId());
            order.setRejectedByName(employee.getName());
            order.setRejectionReason(reason);
            order.setRejectedAt(new java.sql.Timestamp(System.currentTimeMillis()));

            orderRepo.save(order);

            System.out.println("[PaymentController] Payment rejected by: " + employee.getName() +
                    ", Reason: " + reason);

            return ResponseEntity.ok(Map.of(
                    "message", "Payment rejected",
                    "orderId", order.getId(),
                    "status", order.getStatus(),
                    "reason", reason
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reject payment: " + e.getMessage()));
        }
    }

    /**
     * Helper method to assign a delivery employee using round-robin
     */
    private Employee assignDeliveryEmployee() {
        List<Employee> deliveryEmployees = employeeRepo.findByRoleIgnoreCase("Delivery");
        if (deliveryEmployees.isEmpty()) {
            System.out.println("[PaymentController] No delivery employees available");
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
        Employee assigned = deliveryEmployees.stream()
            .min(Comparator.comparing(emp -> employeeOrderCount.getOrDefault(emp.getId(), 0L)))
            .orElse(deliveryEmployees.get(0)); // Fallback to first employee
        
        System.out.println("[PaymentController] Available delivery employees: " + deliveryEmployees.size() +
                ", Assigning to: " + assigned.getName() + " (ID: " + assigned.getId() + 
                "), Current orders: " + employeeOrderCount.getOrDefault(assigned.getId(), 0L));
        return assigned;
    }

    /**
     * Helper method to convert Order to DTO
     */
    private Map<String, Object> convertOrderToDTO(Order order) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", order.getId());
        dto.put("customerId", order.getCustomer() != null ? order.getCustomer().getId() : null);
        dto.put("customerName", order.getCustomer() != null ? order.getCustomer().getUsername() : null);
        dto.put("customerEmail", order.getCustomer() != null ? order.getCustomer().getEmail() : null);
        dto.put("total", order.getTotal());
        dto.put("status", order.getStatus());
        dto.put("deliveryAddress", order.getDeliveryAddress());
        dto.put("paymentMethod", order.getPaymentMethod());
        dto.put("paymentReceipt", order.getPaymentReceipt());
        dto.put("paymentStatus", order.getPaymentStatus());
        dto.put("createdAt", order.getCreatedAt());
        dto.put("details", order.getDetails());

        // Include order items
        List<Map<String, Object>> items = new ArrayList<>();
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("productId", item.getProduct() != null ? item.getProduct().getId() : null);
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("price", item.getPrice());
                items.add(itemMap);
            }
        }
        dto.put("items", items);

        return dto;
    }
}
