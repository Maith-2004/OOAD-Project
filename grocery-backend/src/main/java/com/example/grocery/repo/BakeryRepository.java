package com.example.grocery.repo;

import com.example.grocery.model.Bakery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BakeryRepository extends JpaRepository<Bakery, Long> {
    List<Bakery> findByActiveTrue();
    long countByActiveTrue();
}