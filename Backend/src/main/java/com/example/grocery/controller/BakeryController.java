package com.example.grocery.controller;

import com.example.grocery.model.Bakery;
import com.example.grocery.model.User;
import com.example.grocery.repo.BakeryRepository;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/bakery")
public class BakeryController {
    @Autowired
    private BakeryRepository repo;
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Bakery> all(){ return repo.findAll(); }

    @PostMapping
    public Object createBakery(@RequestBody Bakery item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can create bakery items");
        }
        return repo.save(item);
    }

    @GetMapping("/{id}")
    public Optional<Bakery> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateBakery(@PathVariable Long id, @RequestBody Bakery item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can update bakery items");
        }
        item.setId(id);
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public Object deleteBakery(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can delete bakery items");
        }
        repo.deleteById(id);
        return Map.of("status","deleted");
    }
}