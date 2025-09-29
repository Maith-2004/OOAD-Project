package com.example.grocery.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String status;
    @ManyToOne
    private User customer;
    private Date createdAt = new Date();

    // Optional order details/notes
    private String details;
    // Delivery address for the order
    @Column(name = "delivery_address")
    private String deliveryAddress;
    // List of order items (product, quantity, price)
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();
    private double total;

    // getters & setters
    public Long getId(){return id;}
    public void setId(Long id){this.id=id;}
    public String getStatus(){return status;}
    public void setStatus(String status){this.status=status;}
    public User getCustomer(){return customer;}
    public void setCustomer(User customer){this.customer=customer;}
    public Date getCreatedAt(){return createdAt;}
    public void setCreatedAt(Date d){this.createdAt=d;}
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public double getTotal(){return total;}
    public void setTotal(double t){this.total=t;}
}
