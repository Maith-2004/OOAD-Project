package com.example.grocery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class GroceryBackendApplication {
    public static void main(String[] args) {
        try {
            System.out.println("🚀 Starting Shanthi Stores Backend Application...");
            SpringApplication.run(GroceryBackendApplication.class, args);
            System.out.println("✅ Shanthi Stores Backend Application started successfully!");
        } catch (Exception e) {
            System.err.println("❌ Failed to start application: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "http://localhost:3000",  // Development
                        "https://shanthistores.azurewebsites.net",  // Production
                        "https://shanthistores-efc0fnf6dpczh8bm.italynorth-01.azurewebsites.net"  // Azure URL
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
