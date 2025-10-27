package com.example.grocery.controller;

import com.example.grocery.model.Dairy;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.DairyRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
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
    @Autowired
    private EmployeeRepository employeeRepo;

    @GetMapping
    public List<Dairy> all(){ return repo.findAll(); }

    @PostMapping
    public Object createDairy(@RequestBody Dairy item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can create dairy items");
            }
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can create dairy items");
            }
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @GetMapping("/{id}")
    public Optional<Dairy> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateDairy(@PathVariable Long id, @RequestBody Dairy item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can update dairy items");
            }
            item.setId(id);
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can update dairy items");
            }
            item.setId(id);
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @DeleteMapping("/{id}")
    public Object deleteDairy(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can delete dairy items");
            }
            // Check if product exists
            if (!repo.existsById(id)) {
                return Map.of("error", "Dairy product not found with id: " + id);
            }
            repo.deleteById(id);
            return Map.of("status","deleted", "id", id);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can delete dairy items");
            }
            // Check if product exists
            if (!repo.existsById(id)) {
                return Map.of("error", "Dairy product not found with id: " + id);
            }
            repo.deleteById(id);
            return Map.of("status","deleted", "id", id);
        }
        return Map.of("error", "User not found");
    }
}