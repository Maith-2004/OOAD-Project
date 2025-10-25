package com.example.grocery.repo;

import com.example.grocery.model.Fruits;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FruitsRepository extends JpaRepository<Fruits, Long> {
}