package com.example.grocery.controller;

import com.example.grocery.model.Product;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.ProductRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can create general products");
            }
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
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
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
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
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
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
    public Object deleteProduct(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can delete general products");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can delete general products");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        return Map.of("error", "User not found");
    }
}