package com.example.grocery.controller;

import com.example.grocery.model.Dairy;
import com.example.grocery.model.User;
import com.example.grocery.repo.DairyRepository;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dairy")
public class DairyController {
    @Autowired
    private DairyRepository repo;
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Dairy> all(){ return repo.findAll(); }

    @PostMapping
    public Object createDairy(@RequestBody Dairy item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can create dairy items");
        }
        return repo.save(item);
    }

    @GetMapping("/{id}")
    public Optional<Dairy> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateDairy(@PathVariable Long id, @RequestBody Dairy item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can update dairy items");
        }
        item.setId(id);
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public Object deleteDairy(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can delete dairy items");
        }
        repo.deleteById(id);
        return Map.of("status","deleted");
    }
}