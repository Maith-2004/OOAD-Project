package com.example.grocery.controller;

import com.example.grocery.model.User;
import com.example.grocery.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepo;
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public Map<String,Object> register(@RequestBody Map<String,String> body){
        System.out.println("Register request: " + body);
        try {
            String email = body.get("email");
            String password = body.get("password");
            String role = body.getOrDefault("role","customer");
            String username = body.get("username");
            String phone = body.get("phone");
            String address = body.get("address");
            if(email==null||password==null) {
                return Map.of("error","email and password required");
            }
            if(userRepo.findByEmail(email).isPresent()){
                return Map.of("error","email exists");
            }
            User u = new User();
            u.setEmail(email);
            u.setPassword(encoder.encode(password));
            u.setRole(role);
            u.setUsername(username);
            u.setPhone(phone);
            u.setAddress(address);
            userRepo.save(u);
            return Map.of("message","registered");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Exception: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Map<String,String> body){
        System.out.println("Login request: " + body);
        try {
            String email = body.get("email");
            String password = body.get("password");
            Optional<User> o = userRepo.findByEmail(email);
            if(o.isEmpty()) return Map.of("error","invalid");
            User u = o.get();
            if(!encoder.matches(password,u.getPassword())) return Map.of("error","invalid");
            // For simplicity return user id, role, and address (in production use JWT)
            return Map.of(
                "id",u.getId(),
                "email",u.getEmail(),
                "role",u.getRole(),
                "address",u.getAddress()
            );
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Exception: " + e.getMessage());
        }
    }

    @GetMapping
    public Object all(@RequestHeader("user-id") Long userId) {
        Optional<User> managerOpt = userRepo.findById(userId);
        if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
            return Map.of("error", "Only manager can view users");
        }
        return userRepo.findAll();
    }

    @GetMapping("/{id}")
    public Object getUser(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> managerOpt = userRepo.findById(userId);
        if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
            return Map.of("error", "Only manager can view user details");
        }
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User u = userOpt.get();
        // Return all columns
        return Map.of(
            "id", u.getId(),
            "username", u.getUsername(),
            "email", u.getEmail(),
            "role", u.getRole(),
            "phone", u.getPhone(),
            "address", u.getAddress(),
            "password", u.getPassword()
        );
    }

    @PutMapping("/{id}")
    public Object updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body, @RequestHeader("user-id") Long userId) {
        Optional<User> managerOpt = userRepo.findById(userId);
        if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
            return Map.of("error", "Only manager can update users");
        }
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }
        User u = userOpt.get();
        if (body.containsKey("username")) u.setUsername((String) body.get("username"));
        if (body.containsKey("email")) u.setEmail((String) body.get("email"));
        if (body.containsKey("role")) u.setRole((String) body.get("role"));
        if (body.containsKey("phone")) u.setPhone((String) body.get("phone"));
        if (body.containsKey("address")) u.setAddress((String) body.get("address"));
        if (body.containsKey("password")) u.setPassword((String) body.get("password"));
        return userRepo.save(u);
    }

    @DeleteMapping("/{id}")
    public Object deleteUser(@PathVariable Long id, @RequestHeader("user-id") Long userId) {
        Optional<User> managerOpt = userRepo.findById(userId);
        if (managerOpt.isEmpty() || !"manager".equalsIgnoreCase(managerOpt.get().getRole())) {
            return Map.of("error", "Only manager can delete users");
        }
        userRepo.deleteById(id);
        return Map.of("status","deleted");
    }
}
