package com.example.grocery.controller;

import com.example.grocery.model.Grains;
import com.example.grocery.model.User;
import com.example.grocery.repo.GrainsRepository;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/grains")
public class GrainsController {
    @Autowired
    private GrainsRepository repo;
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Grains> all(){ return repo.findAll(); }

    @PostMapping
    public Object createGrains(@RequestBody Grains item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can create grains items");
        }
        return repo.save(item);
    }

    @GetMapping("/{id}")
    public Optional<Grains> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateGrains(@PathVariable Long id, @RequestBody Grains item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can update grains items");
        }
        item.setId(id);
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public Object deleteGrains(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager or worker can delete grains items");
        }
        repo.deleteById(id);
        return Map.of("status","deleted");
    }
}