package com.example.grocery.controller;

import com.example.grocery.model.Bakery;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.BakeryRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
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
    @Autowired
    private EmployeeRepository employeeRepo;

    @GetMapping
    public List<Bakery> all(){ return repo.findAll(); }

    @PostMapping
    public Object createBakery(@RequestBody Bakery item, @RequestHeader("user-id") Long userId) {
        // Check users table first
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can create bakery items");
            }
            return repo.save(item);
        }
        
        // Check employees table
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can create bakery items");
            }
            return repo.save(item);
        }
        
        return Map.of("error", "User not found");
    }

    @GetMapping("/{id}")
    public Optional<Bakery> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateBakery(@PathVariable Long id, @RequestBody Bakery item, @RequestHeader("user-id") Long userId) {
        // Check users table first
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can update bakery items");
            }
            item.setId(id);
            return repo.save(item);
        }
        
        // Check employees table
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can update bakery items");
            }
            item.setId(id);
            return repo.save(item);
        }
        
        return Map.of("error", "User not found");
    }

    @DeleteMapping("/{id}")
    public Object deleteBakery(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        // Check users table first
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can delete bakery items");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        
        // Check employees table
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can delete bakery items");
            }
            repo.deleteById(id);
            return Map.of("status","deleted");
        }
        
        return Map.of("error", "User not found");
    }
}