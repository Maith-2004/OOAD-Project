package com.example.grocery.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username; // user's name for login/registration
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    @Column(nullable = false)
    private String role; // only "manager" or "customer"
    private String phone;
    private String address;

    // getters and setters
    public Long getId(){return id;}
    public void setId(Long id){this.id=id;}
    public String getUsername(){return username;}
    public void setUsername(String username){this.username=username;}
    public String getEmail(){return email;}
    public void setEmail(String email){this.email=email;}
    public String getPassword(){return password;}
    public void setPassword(String password){this.password=password;}
    public String getRole(){return role;}
    public void setRole(String role){this.role=role;}
    public String getPhone(){return phone;}
    public void setPhone(String phone){this.phone=phone;}
    public String getAddress(){return address;}
    public void setAddress(String address){this.address=address;}
}
