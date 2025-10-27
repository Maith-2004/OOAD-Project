package com.example.grocery.controller;

import com.example.grocery.model.Bakery;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.BakeryRepository;
import com.example.grocery.repo.UserRepository;
import com.example.grocery.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can create bakery items");
            }
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
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
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can update bakery items");
            }
            item.setId(id);
            return repo.save(item);
        }
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                return Map.of("error", "Only manager or worker can update bakery items");
            }
            item.setId(id);
            return repo.save(item);
        }
        return Map.of("error", "User not found");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBakery(@PathVariable Long id, @RequestHeader(value = "user-id", required = false) Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "user-id header is required"));
            }
            
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String role = user.getRole();
                if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only manager or worker can delete bakery items"));
                }
                if (!repo.existsById(id)) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Bakery product not found with id: " + id));
                }
                repo.deleteById(id);
                return ResponseEntity.ok(Map.of("status","deleted", "id", id));
            }
            Optional<Employee> empOpt = employeeRepo.findById(userId);
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                String role = emp.getRole();
                if (!"manager".equalsIgnoreCase(role) && !"worker".equalsIgnoreCase(role) && !"worker employee".equalsIgnoreCase(role)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only manager or worker can delete bakery items"));
                }
                if (!repo.existsById(id)) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Bakery product not found with id: " + id));
                }
                repo.deleteById(id);
                return ResponseEntity.ok(Map.of("status","deleted", "id", id));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "Cannot delete bakery product: it is referenced in existing orders or other records"
            ));
        } catch (Exception e) {
            System.err.println("[BakeryController] DELETE Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete bakery product: " + e.getMessage()));
        }
    }
}