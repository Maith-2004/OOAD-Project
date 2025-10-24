package com.example.grocery.repo;
import com.example.grocery.model.Order;
import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * OrderRepository
 * Data access layer for Order entity
 */
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find all orders for a specific customer
     * Used by CustomerOrderHistory component
     * 
     * @param customer The User entity
     * @return List of orders for the customer
     */
    List<Order> findByCustomer(User customer);
    
    /**
     * Find all orders assigned to a specific delivery employee
     * Used by DeliveryEmployeeDashboard component
     * 
     * @param employee The Employee entity
     * @return List of orders assigned to the delivery employee
     */
    List<Order> findByDeliveryEmployee(Employee employee);
    
    /**
     * Find orders by status
     * @param status The order status
     * @return List of orders with specified status
     */
    List<Order> findByStatus(String status);
    
    /**
     * Find orders by payment status
     * @param paymentStatus The payment status
     * @return List of orders with specified payment status
     */
    List<Order> findByPaymentStatus(String paymentStatus);
}
