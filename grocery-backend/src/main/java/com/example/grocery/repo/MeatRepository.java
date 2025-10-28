package com.example.grocery.repo;

import com.example.grocery.model.Meat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MeatRepository extends JpaRepository<Meat, Long> {
    List<Meat> findByActiveTrue();
    long countByActiveTrue();
}