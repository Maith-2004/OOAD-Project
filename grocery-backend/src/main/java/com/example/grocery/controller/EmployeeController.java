package com.example.grocery.controller;

import com.example.grocery.model.Employee;
import com.example.grocery.model.User;
import com.example.grocery.repo.EmployeeRepository;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    @Autowired
    private EmployeeRepository employeeRepo;
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Employee> all() {
        return employeeRepo.findAll();
    }

    @PostMapping
    public Object addEmployee(@RequestBody Map<String, Object> body, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can add employees");
        }
        Employee e = new Employee();
        e.setName((String) body.get("name"));
        e.setAddress((String) body.get("address"));
        e.setPhoneNumber((String) body.get("phoneNumber"));
        e.setRole((String) body.get("role"));
        try {
            e.setBirthdate(java.sql.Date.valueOf((String) body.get("birthdate")));
        } catch (Exception ex) {
            return Map.of("error", "Invalid birthdate format. Use yyyy-MM-dd");
        }
        return employeeRepo.save(e);
    }

    @DeleteMapping("/{id}")
    public Object deleteEmployee(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User user = userOpt.get();
        if (!"manager".equalsIgnoreCase(user.getRole())) {
            return Map.of("error", "Only manager can delete employees");
        }
        employeeRepo.deleteById(id);
        return Map.of("status", "deleted");
    }
            @PutMapping("/{id}")
            public Object updateEmployee(@PathVariable Long id, @RequestBody Map<String, Object> body, @RequestHeader("user-id") Long userId) {
                Optional<User> userOpt = userRepo.findById(userId);
                if (userOpt.isEmpty()) {
                    return Map.of("error", "User not found");
                }
                User user = userOpt.get();
                if (!"manager".equalsIgnoreCase(user.getRole())) {
                    return Map.of("error", "Only manager can update employees");
                }
                Optional<Employee> empOpt = employeeRepo.findById(id);
                if (empOpt.isEmpty()) {
                    return Map.of("error", "Employee not found");
                }
                Employee e = empOpt.get();
                if (body.containsKey("name")) e.setName((String) body.get("name"));
                if (body.containsKey("address")) e.setAddress((String) body.get("address"));
                if (body.containsKey("phoneNumber")) e.setPhoneNumber((String) body.get("phoneNumber"));
                if (body.containsKey("role")) e.setRole((String) body.get("role"));
                if (body.containsKey("birthdate")) {
                    try {
                        e.setBirthdate(java.sql.Date.valueOf((String) body.get("birthdate")));
                    } catch (Exception ex) {
                        return Map.of("error", "Invalid birthdate format. Use yyyy-MM-dd");
                    }
                }
                return employeeRepo.save(e);
            }
}
