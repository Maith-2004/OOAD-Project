package com.example.grocery.controller;

import com.example.grocery.model.Product;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.ProductRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductRepository repo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private EmployeeRepository employeeRepo;

    @GetMapping
    public List<Product> all(){ return repo.findAll(); }

    @PostMapping
    public Object createProduct(@RequestBody Product item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can create general products");
            }
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can create general products");
            }
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @GetMapping("/{id}")
    public Optional<Product> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateProduct(@PathVariable Long id, @RequestBody Product item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can update general products");
            }
            
            // Check if product exists in general products table
            Optional<Product> existingProduct = repo.findById(id);
            if (!existingProduct.isPresent()) {
                return Map.of(
                    "error", "Product not found in general products category. Use /api/categories/products/{id} endpoint for category-specific products.",
                    "hint", "This product may belong to a specific category (bakery, fruits, dairy, etc.)"
                );
            }
            
            // Update existing product
            Product existing = existingProduct.get();
            existing.setName(item.getName());
            existing.setDescription(item.getDescription());
            existing.setPrice(item.getPrice());
            existing.setQuantity(item.getQuantity());
            if (item.getImage() != null) {
                existing.setImage(item.getImage());
            }
            return repo.save(existing);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can update general products");
            }
            
            // Check if product exists in general products table
            Optional<Product> existingProduct = repo.findById(id);
            if (!existingProduct.isPresent()) {
                return Map.of(
                    "error", "Product not found in general products category. Use /api/categories/products/{id} endpoint for category-specific products.",
                    "hint", "This product may belong to a specific category (bakery, fruits, dairy, etc.)"
                );
            }
            
            // Update existing product
            Product existing = existingProduct.get();
            existing.setName(item.getName());
            existing.setDescription(item.getDescription());
            existing.setPrice(item.getPrice());
            existing.setQuantity(item.getQuantity());
            if (item.getImage() != null) {
                existing.setImage(item.getImage());
            }
            return repo.save(existing);
        }
        return Map.of("error", "User not found");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestHeader(value = "user-id", required = false) Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "user-id header is required"));
            }
            
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String role = user.getRole();
                if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only manager or worker can delete general products"));
                }
                // Check if product exists
                if (!repo.existsById(id)) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found with id: " + id));
                }
                repo.deleteById(id);
                return ResponseEntity.ok(Map.of("status","deleted", "id", id));
            }
            Optional<Employee> empOpt = employeeRepo.findById(userId);
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                String role = emp.getRole();
                if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only manager or worker can delete general products"));
                }
                // Check if product exists
                if (!repo.existsById(id)) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found with id: " + id));
                }
                repo.deleteById(id);
                return ResponseEntity.ok(Map.of("status","deleted", "id", id));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        } catch (Exception e) {
            System.err.println("[ProductController] DELETE Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete product: " + e.getMessage()));
        }
    }
}