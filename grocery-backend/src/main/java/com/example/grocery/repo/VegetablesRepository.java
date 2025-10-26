package com.example.grocery.repo;

import com.example.grocery.model.Vegetables;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VegetablesRepository extends JpaRepository<Vegetables, Long> {
}