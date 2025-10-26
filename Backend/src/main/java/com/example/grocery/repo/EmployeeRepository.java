package com.example.grocery.repo;

import com.example.grocery.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // Find all delivery employees
    List<Employee> findByRoleIgnoreCase(String role);
    
    // Find delivery employees with optional limit for load balancing
    @Query("SELECT e FROM Employee e WHERE LOWER(e.role) = LOWER('Delivery') ORDER BY e.id")
    List<Employee> findDeliveryEmployees();
    
    // Find employee by email for login
    Optional<Employee> findByEmail(String email);
}
