package com.example.grocery.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "timestamp", System.currentTimeMillis(),
            "service", "Shanthi Stores Backend",
            "version", "1.0.0"
        );
    }

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
            "message", "Shanthi Stores API is running",
            "status", "OK",
            "timestamp", System.currentTimeMillis()
        );
    }
}