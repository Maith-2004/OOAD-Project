package com.example.grocery.controller;

import com.example.grocery.model.Product;
import com.example.grocery.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.grocery.model.User;
import com.example.grocery.repo.UserRepository;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductRepository repo;
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Product> all(){ return repo.findAll(); }

    @PostMapping
    public Object createProduct(@RequestBody Product p, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can create products");
        }
        return repo.save(p);
    }

    @GetMapping("/{id}")
    public Optional<Product> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateProduct(@PathVariable Long id, @RequestBody Product p, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can update products");
        }
        p.setId(id);
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public Object deleteProduct(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can delete products");
        }
        repo.deleteById(id);
        return Map.of("status","deleted");
    }
}
