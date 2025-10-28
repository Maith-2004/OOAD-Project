package com.example.grocery.repo;

import com.example.grocery.model.Grains;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GrainsRepository extends JpaRepository<Grains, Long> {
    List<Grains> findByActiveTrue();
    long countByActiveTrue();
}