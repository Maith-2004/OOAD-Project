package com.example.grocery.controller;

import com.example.grocery.model.Beverages;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.BeveragesRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/beverages")
public class BeveragesController {
    @Autowired
    private BeveragesRepository repo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private EmployeeRepository employeeRepo;

    @GetMapping
    public List<Beverages> all(){ return repo.findAll(); }

    @PostMapping
    public Object createBeverages(@RequestBody Beverages item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can create beverages items");
            }
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can create beverages items");
            }
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @GetMapping("/{id}")
    public Optional<Beverages> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateBeverages(@PathVariable Long id, @RequestBody Beverages item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can update beverages items");
            }
            item.setId(id);
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can update beverages items");
            }
            item.setId(id);
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @DeleteMapping("/{id}")
    public Object deleteBeverages(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can delete beverages items");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can delete beverages items");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        return Map.of("error", "User not found");
    }
}