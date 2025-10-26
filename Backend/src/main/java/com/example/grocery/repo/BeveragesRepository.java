package com.example.grocery.repo;

import com.example.grocery.model.Beverages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BeveragesRepository extends JpaRepository<Beverages, Long> {
}