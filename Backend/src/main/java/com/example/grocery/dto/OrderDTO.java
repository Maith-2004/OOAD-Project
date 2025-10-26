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
    private Long deliveryEmployeeId;
    private String deliveryEmployeeName;
    private String paymentMethod;
    private String paymentReceipt;
    private String paymentStatus;
    private Long paymentHandlerId;
    private String paymentHandlerName;

    public OrderDTO(Long id, Long customerId, String status, Date createdAt, String details, String deliveryAddress, 
                    List<OrderItem> items, double total, Long deliveryEmployeeId, String deliveryEmployeeName,
                    String paymentMethod, String paymentReceipt, String paymentStatus, 
                    Long paymentHandlerId, String paymentHandlerName) {
        this.id = id;
        this.customerId = customerId;
        this.status = status;
        this.createdAt = createdAt;
        this.details = details;
        this.deliveryAddress = deliveryAddress;
        this.items = items;
        this.total = total;
        this.deliveryEmployeeId = deliveryEmployeeId;
        this.deliveryEmployeeName = deliveryEmployeeName;
        this.paymentMethod = paymentMethod;
        this.paymentReceipt = paymentReceipt;
        this.paymentStatus = paymentStatus;
        this.paymentHandlerId = paymentHandlerId;
        this.paymentHandlerName = paymentHandlerName;
    }

    // Backward compatibility constructor
    public OrderDTO(Long id, Long customerId, String status, Date createdAt, String details, String deliveryAddress, 
                    List<OrderItem> items, double total, Long deliveryEmployeeId, String deliveryEmployeeName) {
        this(id, customerId, status, createdAt, details, deliveryAddress, items, total, 
             deliveryEmployeeId, deliveryEmployeeName, null, null, null, null, null);
    }

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public String getStatus() { return status; }
    public Date getCreatedAt() { return createdAt; }
    public String getDetails() { return details; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public List<OrderItem> getItems() { return items; }
    public double getTotal() { return total; }
    public Long getDeliveryEmployeeId() { return deliveryEmployeeId; }
    public String getDeliveryEmployeeName() { return deliveryEmployeeName; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentReceipt() { return paymentReceipt; }
    public String getPaymentStatus() { return paymentStatus; }
    public Long getPaymentHandlerId() { return paymentHandlerId; }
    public String getPaymentHandlerName() { return paymentHandlerName; }
}
