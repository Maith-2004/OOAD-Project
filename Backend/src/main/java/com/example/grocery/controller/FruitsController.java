package com.example.grocery.controller;

import com.example.grocery.model.Fruits;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.FruitsRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
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
    @Autowired
    private EmployeeRepository employeeRepo;

    @GetMapping
    public List<Fruits> all(){ return repo.findAll(); }

    @PostMapping
    public Object createFruits(@RequestBody Fruits item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can create fruits items");
            }
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can create fruits items");
            }
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @GetMapping("/{id}")
    public Optional<Fruits> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateFruits(@PathVariable Long id, @RequestBody Fruits item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can update fruits items");
            }
            item.setId(id);
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can update fruits items");
            }
            item.setId(id);
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @DeleteMapping("/{id}")
    public Object deleteFruits(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can delete fruits items");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can delete fruits items");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        return Map.of("error", "User not found");
    }
}