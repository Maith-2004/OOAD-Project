package com.example.grocery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Map;
import java.time.LocalDateTime;

@SpringBootApplication
@RestController
public class GroceryBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(GroceryBackendApplication.class, args);
    }

    @GetMapping("/api/version")
    public Map<String, Object> getVersion() {
        return Map.of(
            "version", "1.1.0-SOFT-DELETE",
            "timestamp", LocalDateTime.now().toString(),
            "feature", "Soft Delete Implementation - Products marked as inactive instead of hard delete",
            "status", "Active"
        );
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "http://localhost:3000",  // Development
                        "https://shanthistores.azurewebsites.net"  // Production
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
