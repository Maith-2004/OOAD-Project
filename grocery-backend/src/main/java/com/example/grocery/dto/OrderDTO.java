package com.example.grocery.dto;

import com.example.grocery.model.OrderItem;
import java.util.Date;
import java.util.List;

public class OrderDTO {
    private Long id;
    private Long customerId;
    private String status;
    private Date createdAt;
    private String details;
    private String deliveryAddress;
    private List<OrderItem> items;
    private double total;

    public OrderDTO(Long id, Long customerId, String status, Date createdAt, String details, String deliveryAddress, List<OrderItem> items, double total) {
        this.id = id;
        this.customerId = customerId;
        this.status = status;
        this.createdAt = createdAt;
        this.details = details;
        this.deliveryAddress = deliveryAddress;
        this.items = items;
        this.total = total;
    }

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public String getStatus() { return status; }
    public Date getCreatedAt() { return createdAt; }
    public String getDetails() { return details; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public List<OrderItem> getItems() { return items; }
    public double getTotal() { return total; }
}
