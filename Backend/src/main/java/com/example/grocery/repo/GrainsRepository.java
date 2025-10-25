package com.example.grocery.repo;

import com.example.grocery.model.Grains;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrainsRepository extends JpaRepository<Grains, Long> {
}