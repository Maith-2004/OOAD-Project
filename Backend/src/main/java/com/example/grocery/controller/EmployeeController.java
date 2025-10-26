package com.example.grocery.controller;

import com.example.grocery.model.Employee;
import com.example.grocery.model.User;
import com.example.grocery.repo.EmployeeRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    @Autowired
    private EmployeeRepository employeeRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private OrderRepository orderRepo;

    @GetMapping
    public Object all(@RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can view employees");
        }
        return employeeRepo.findAll();
    }

    @GetMapping("/{id}")
    public Object getEmployee(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can view employee details");
        }
        Optional<Employee> empOpt = employeeRepo.findById(id);
        if (empOpt.isEmpty()) {
            return Map.of("error", "Employee not found");
        }
        Employee e = empOpt.get();
        // Return employee data including password (for manager editing)
        return Map.of(
            "id", e.getId(),
            "name", e.getName(),
            "email", e.getEmail(),
            "password", e.getPassword(), // Managers can see passwords for editing
            "role", e.getRole(),
            "address", e.getAddress(),
            "phoneNumber", e.getPhoneNumber(),
            "birthdate", e.getBirthdate()
        );
    }

    @PostMapping
    public Object addEmployee(@RequestBody Map<String, Object> body, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can add employees");
        }

        // Validate required fields
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        String name = (String) body.get("name");
        String role = (String) body.get("role");

        if (email == null || email.trim().isEmpty()) {
            return Map.of("error", "Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            return Map.of("error", "Password is required");
        }
        if (name == null || name.trim().isEmpty()) {
            return Map.of("error", "Name is required");
        }
        if (role == null || role.trim().isEmpty()) {
            return Map.of("error", "Role is required");
        }

        // Validate role is one of the allowed values
        if (!role.equals("Delivery") && !role.equals("Worker") && !role.equals("Payment Handler")) {
            return Map.of("error", "Role must be one of: Delivery, Worker, Payment Handler");
        }

        // Check if email already exists
        Optional<Employee> existingEmp = employeeRepo.findByEmail(email);
        if (existingEmp.isPresent()) {
            return Map.of("error", "Email already exists");
        }

        Employee e = new Employee();
        e.setName(name);
        e.setEmail(email);
        e.setPassword(password); // In production, this should be encrypted
        e.setAddress((String) body.get("address"));
        e.setPhoneNumber((String) body.get("phoneNumber"));
        e.setRole(role);
        
        if (body.containsKey("birthdate")) {
            try {
                e.setBirthdate(java.sql.Date.valueOf((String) body.get("birthdate")));
            } catch (Exception ex) {
                return Map.of("error", "Invalid birthdate format. Use yyyy-MM-dd");
            }
        }
        
        try {
            Employee savedEmployee = employeeRepo.save(e);
            // Return employee data without password
            return Map.of(
                "id", savedEmployee.getId(),
                "name", savedEmployee.getName(),
                "email", savedEmployee.getEmail(),
                "role", savedEmployee.getRole(),
                "address", savedEmployee.getAddress(),
                "phoneNumber", savedEmployee.getPhoneNumber(),
                "birthdate", savedEmployee.getBirthdate()
            );
        } catch (Exception ex) {
            return Map.of("error", "Failed to create employee: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Object deleteEmployee(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can delete employees");
        }
        employeeRepo.deleteById(id);
        return Map.of("status", "deleted");
    }
    /**
     * GET /api/employees/{employeeId}/orders
     * Get all orders assigned to a specific delivery employee
     */
    @GetMapping("/{employeeId}/orders")
    public Object getEmployeeOrders(@PathVariable Long employeeId) {
        try {
            // Verify employee exists
            Optional<Employee> empOpt = employeeRepo.findById(employeeId);
            if (empOpt.isEmpty()) {
                return Map.of("error", "Employee not found");
            }
            
            Employee employee = empOpt.get();
            
            // Verify employee is a delivery employee
            if (!"Delivery".equalsIgnoreCase(employee.getRole())) {
                return Map.of("error", "Only delivery employees can view assigned orders");
            }
            
            // Get all orders assigned to this delivery employee
            List<com.example.grocery.model.Order> orders = 
                orderRepo.findByDeliveryEmployee(employee);
            
            // Convert to DTOs with customer and order details
            List<Map<String, Object>> orderDTOs = new ArrayList<>();
            for (com.example.grocery.model.Order order : orders) {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", order.getId());
                dto.put("status", order.getStatus());
                dto.put("total", order.getTotal());
                dto.put("createdAt", order.getCreatedAt());
                dto.put("deliveryAddress", order.getDeliveryAddress());
                dto.put("paymentMethod", order.getPaymentMethod());
                dto.put("paymentStatus", order.getPaymentStatus());
                
                // Customer info
                if (order.getCustomer() != null) {
                    dto.put("customerId", order.getCustomer().getId());
                    dto.put("customerName", order.getCustomer().getUsername());
                    dto.put("customerPhone", order.getCustomer().getPhone());
                }
                
                // Order items
                List<Map<String, Object>> items = new ArrayList<>();
                if (order.getItems() != null) {
                    for (var item : order.getItems()) {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("productName", item.getProduct() != null ? item.getProduct().getName() : "Unknown");
                        itemMap.put("quantity", item.getQuantity());
                        itemMap.put("price", item.getPrice());
                        items.add(itemMap);
                    }
                }
                dto.put("items", items);
                
                orderDTOs.add(dto);
            }
            
            return Map.of(
                "employeeName", employee.getName(),
                "employeeId", employee.getId(),
                "totalOrders", orderDTOs.size(),
                "orders", orderDTOs
            );
            
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Failed to fetch orders: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Object updateEmployee(@PathVariable Long id, @RequestBody Map<String, Object> body, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can update employees");
        }
        Optional<Employee> empOpt = employeeRepo.findById(id);
        if (empOpt.isEmpty()) {
            return Map.of("error", "Employee not found");
        }
        Employee e = empOpt.get();
        
        if (body.containsKey("name")) e.setName((String) body.get("name"));
        if (body.containsKey("address")) e.setAddress((String) body.get("address"));
        if (body.containsKey("phoneNumber")) e.setPhoneNumber((String) body.get("phoneNumber"));
        
        // Handle role update with validation
        if (body.containsKey("role")) {
            String role = (String) body.get("role");
            if (!role.equals("Delivery") && !role.equals("Worker") && !role.equals("Payment Handler")) {
                return Map.of("error", "Role must be one of: Delivery, Worker, Payment Handler");
            }
            e.setRole(role);
        }
        
        // Handle email update with uniqueness check
        if (body.containsKey("email")) {
            String email = (String) body.get("email");
            if (email == null || email.trim().isEmpty()) {
                return Map.of("error", "Email cannot be empty");
            }
            // Check if email is already used by another employee
            Optional<Employee> existingEmp = employeeRepo.findByEmail(email);
            if (existingEmp.isPresent() && !existingEmp.get().getId().equals(id)) {
                return Map.of("error", "Email already exists");
            }
            e.setEmail(email);
        }
        
        // Handle password update
        if (body.containsKey("password")) {
            String password = (String) body.get("password");
            if (password == null || password.trim().isEmpty()) {
                return Map.of("error", "Password cannot be empty");
            }
            e.setPassword(password); // In production, this should be encrypted
        }
        
        if (body.containsKey("birthdate")) {
            try {
                e.setBirthdate(java.sql.Date.valueOf((String) body.get("birthdate")));
            } catch (Exception ex) {
                return Map.of("error", "Invalid birthdate format. Use yyyy-MM-dd");
            }
        }
        
        try {
            Employee savedEmployee = employeeRepo.save(e);
            // Return employee data without password
            return Map.of(
                "id", savedEmployee.getId(),
                "name", savedEmployee.getName(),
                "email", savedEmployee.getEmail(),
                "role", savedEmployee.getRole(),
                "address", savedEmployee.getAddress(),
                "phoneNumber", savedEmployee.getPhoneNumber(),
                "birthdate", savedEmployee.getBirthdate()
            );
        } catch (Exception ex) {
            return Map.of("error", "Failed to update employee: " + ex.getMessage());
        }
    }
}
