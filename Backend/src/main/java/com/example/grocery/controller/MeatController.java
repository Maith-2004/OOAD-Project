package com.example.grocery.controller;

import com.example.grocery.model.Meat;
import com.example.grocery.model.User;
import com.example.grocery.repo.MeatRepository;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/meat")
public class MeatController {
    @Autowired
    private MeatRepository repo;
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Meat> all(){ return repo.findAll(); }

    @PostMapping
    public Object createMeat(@RequestBody Meat item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can create meat items");
        }
        return repo.save(item);
    }

    @GetMapping("/{id}")
    public Optional<Meat> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateMeat(@PathVariable Long id, @RequestBody Meat item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can update meat items");
        }
        item.setId(id);
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public Object deleteMeat(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can delete meat items");
        }
        repo.deleteById(id);
        return Map.of("status","deleted");
    }
}