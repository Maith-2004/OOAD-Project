package com.example.grocery.repo;
import com.example.grocery.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductRepository extends JpaRepository<Product, Long> {}
