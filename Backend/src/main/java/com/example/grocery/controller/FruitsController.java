package com.example.grocery.controller;

import com.example.grocery.model.Fruits;
import com.example.grocery.model.User;
import com.example.grocery.repo.FruitsRepository;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/fruits")
public class FruitsController {
    @Autowired
    private FruitsRepository repo;
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Fruits> all(){ return repo.findAll(); }

    @PostMapping
    public Object createFruits(@RequestBody Fruits item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can create fruits items");
        }
        return repo.save(item);
    }

    @GetMapping("/{id}")
    public Optional<Fruits> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateFruits(@PathVariable Long id, @RequestBody Fruits item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can update fruits items");
        }
        item.setId(id);
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public Object deleteFruits(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can delete fruits items");
        }
        repo.deleteById(id);
        return Map.of("status","deleted");
    }
}