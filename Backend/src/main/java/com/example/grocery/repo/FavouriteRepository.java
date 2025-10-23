package com.example.grocery.repo;

import com.example.grocery.model.Favourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavouriteRepository extends JpaRepository<Favourite, Long> {
    
    // Find all favourites for a specific user
    List<Favourite> findByUserId(Long userId);
    
    // Find a specific favourite by user and product
    Optional<Favourite> findByUserIdAndProductId(Long userId, Long productId);
    
    // Delete a specific favourite
    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    // Check if a product is in user's favourites
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    // Get product IDs for a user's favourites
    @Query("SELECT f.productId FROM Favourite f WHERE f.userId = :userId")
    List<Long> findProductIdsByUserId(Long userId);
}
