package com.example.grocery.repo;

import com.example.grocery.model.Dairy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DairyRepository extends JpaRepository<Dairy, Long> {
}