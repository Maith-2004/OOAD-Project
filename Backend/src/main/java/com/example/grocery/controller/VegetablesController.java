package com.example.grocery.controller;

import com.example.grocery.model.Vegetables;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.VegetablesRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/vegetables")
public class VegetablesController {
    @Autowired
    private VegetablesRepository repo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private EmployeeRepository employeeRepo;

    @GetMapping
    public List<Vegetables> all(){ return repo.findAll(); }

    @PostMapping
    public Object createVegetables(@RequestBody Vegetables item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can create vegetables items");
            }
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can create vegetables items");
            }
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @GetMapping("/{id}")
    public Optional<Vegetables> get(@PathVariable Long id){ return repo.findById(id); }

    @PutMapping("/{id}")
    public Object updateVegetables(@PathVariable Long id, @RequestBody Vegetables item, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can update vegetables items");
            }
            item.setId(id);
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can update vegetables items");
            }
            item.setId(id);
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @DeleteMapping("/{id}")
    public Object deleteVegetables(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!"manager".equalsIgnoreCase(user.getRole()) && !"worker".equalsIgnoreCase(user.getRole())) {
                return Map.of("error", "Only manager or worker can delete vegetables items");
            }
            if (repo.existsById(id)) {
                repo.deleteById(id);
                return Map.of("status", "deleted");
            }
            return Map.of("error", "Vegetables not found");
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (!"manager".equalsIgnoreCase(emp.getRole()) && !"worker".equalsIgnoreCase(emp.getRole())) {
                return Map.of("error", "Only manager or worker can delete vegetables items");
            }
            if (repo.existsById(id)) {
                repo.deleteById(id);
                return Map.of("status", "deleted");
            }
            return Map.of("error", "Vegetables not found");
        }
        return Map.of("error", "User not found");
    }
}