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

    // Assigned delivery employee
    @ManyToOne
    @JoinColumn(name = "delivery_employee_id")
    private Employee deliveryEmployee;

    // Payment handler employee (for bank payment approval)
    @ManyToOne
    @JoinColumn(name = "payment_handler_id")
    private Employee paymentHandler;

    // Payment method: "cash" or "bank"
    @Column(name = "payment_method")
    private String paymentMethod;

    // Payment receipt/slip filename (for bank payment)
    @Column(name = "payment_receipt")
    private String paymentReceipt;

    // Payment status: "pending", "approved", "rejected" (for bank payment)
    @Column(name = "payment_status")
    private String paymentStatus;
    // Payment approval/rejection tracking fields
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approved_by_name")
    private String approvedByName;
    
    @Column(name = "rejected_by")
    private Long rejectedBy;
    
    @Column(name = "rejected_by_name")
    private String rejectedByName;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "approved_at")
    private java.sql.Timestamp approvedAt;
    
    @Column(name = "rejected_at")
    private java.sql.Timestamp rejectedAt;

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
    public Employee getDeliveryEmployee() { return deliveryEmployee; }
    public void setDeliveryEmployee(Employee deliveryEmployee) { this.deliveryEmployee = deliveryEmployee; }
    public Employee getPaymentHandler() { return paymentHandler; }
    public void setPaymentHandler(Employee paymentHandler) { this.paymentHandler = paymentHandler; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentReceipt() { return paymentReceipt; }
    public void setPaymentReceipt(String paymentReceipt) { this.paymentReceipt = paymentReceipt; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    // Approval/rejection tracking getters/setters
    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }
    public String getApprovedByName() { return approvedByName; }
    public void setApprovedByName(String approvedByName) { this.approvedByName = approvedByName; }
    public Long getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(Long rejectedBy) { this.rejectedBy = rejectedBy; }
    public String getRejectedByName() { return rejectedByName; }
    public void setRejectedByName(String rejectedByName) { this.rejectedByName = rejectedByName; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public java.sql.Timestamp getApprovedAt() { return approvedAt; }
    public void setApprovedAt(java.sql.Timestamp approvedAt) { this.approvedAt = approvedAt; }
    public java.sql.Timestamp getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(java.sql.Timestamp rejectedAt) { this.rejectedAt = rejectedAt; }
}
