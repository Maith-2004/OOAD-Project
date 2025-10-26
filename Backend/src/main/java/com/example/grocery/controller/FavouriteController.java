package com.example.grocery.controller;

import com.example.grocery.model.Favourite;
import com.example.grocery.model.Product;
import com.example.grocery.repo.FavouriteRepository;
import com.example.grocery.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/favourites")
public class FavouriteController {

    @Autowired
    private FavouriteRepository favouriteRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * GET /api/favourites/:userId
     * Get all favourite products for a specific user
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserFavourites(@PathVariable Long userId) {
        try {
            // Get all favourite product IDs for the user
            List<Long> productIds = favouriteRepository.findProductIdsByUserId(userId);
            
            // Fetch full product details for each favourite
            List<Product> favouriteProducts = new ArrayList<>();
            for (Long productId : productIds) {
                Optional<Product> product = productRepository.findById(productId);
                product.ifPresent(favouriteProducts::add);
            }
            
            return ResponseEntity.ok(favouriteProducts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch favourites: " + e.getMessage()));
        }
    }

    /**
     * POST /api/favourites
     * Add a product to user's favourites
     * Body: { "userId": 1, "productId": 5 }
     */
    @PostMapping
    public ResponseEntity<?> addToFavourites(@RequestBody Map<String, Object> body) {
        try {
            // Extract userId and productId from request body
            Long userId = Long.valueOf(body.get("userId").toString());
            Long productId = Long.valueOf(body.get("productId").toString());

            if (userId == null || productId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "userId and productId are required"));
            }

            // Check if product exists
            Optional<Product> product = productRepository.findById(productId);
            if (product.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Product not found"));
            }

            // Check if already in favourites
            if (favouriteRepository.existsByUserIdAndProductId(userId, productId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Product already in favourites"));
            }

            // Create and save new favourite
            Favourite favourite = new Favourite(userId, productId);
            favouriteRepository.save(favourite);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Added to favourites successfully", "id", favourite.getId()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Product already in favourites"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid userId or productId format"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add to favourites: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/favourites/:userId/:productId
     * Remove a product from user's favourites
     */
    @DeleteMapping("/{userId}/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromFavourites(
            @PathVariable Long userId, 
            @PathVariable Long productId) {
        try {
            // Check if favourite exists
            Optional<Favourite> favourite = favouriteRepository.findByUserIdAndProductId(userId, productId);
            
            if (favourite.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Favourite not found"));
            }

            // Delete the favourite
            favouriteRepository.deleteByUserIdAndProductId(userId, productId);

            return ResponseEntity.ok()
                    .body(Map.of("message", "Removed from favourites successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove from favourites: " + e.getMessage()));
        }
    }

    /**
     * GET /api/favourites/:userId/check/:productId
     * Check if a product is in user's favourites
     */
    @GetMapping("/{userId}/check/{productId}")
    public ResponseEntity<?> checkFavourite(
            @PathVariable Long userId, 
            @PathVariable Long productId) {
        try {
            boolean isFavourite = favouriteRepository.existsByUserIdAndProductId(userId, productId);
            return ResponseEntity.ok(Map.of("isFavourite", isFavourite));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check favourite status: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/favourites/:userId
     * Clear all favourites for a user
     */
    @DeleteMapping("/{userId}")
    @Transactional
    public ResponseEntity<?> clearUserFavourites(@PathVariable Long userId) {
        try {
            List<Favourite> favourites = favouriteRepository.findByUserId(userId);
            favouriteRepository.deleteAll(favourites);
            
            return ResponseEntity.ok()
                    .body(Map.of("message", "All favourites cleared successfully", 
                                 "count", favourites.size()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear favourites: " + e.getMessage()));
        }
    }
}
