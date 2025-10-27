
-- Grocery Management System Database Schema
-- Contains all tables for users, employees, orders, and product categories

-- Users table for customer accounts and managers
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    address VARCHAR(255)
);

-- Employees table for staff management
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    address VARCHAR(255),
    phone_number VARCHAR(255),
    birthdate DATE,
    role VARCHAR(255)
);

-- General products table for items that don't fit into specific categories
-- (household items, cleaning supplies, batteries, etc.)
CREATE TABLE IF NOT EXISTS product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Category-specific product tables
-- Bakery products (bread, pastries, cakes, etc.)
CREATE TABLE IF NOT EXISTS bakery (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Fresh fruits
CREATE TABLE IF NOT EXISTS fruits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Dairy products (milk, cheese, yogurt, etc.)
CREATE TABLE IF NOT EXISTS dairy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Meat products
CREATE TABLE IF NOT EXISTS meat (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Beverages (juices, sodas, water, etc.)
CREATE TABLE IF NOT EXISTS beverages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Grains and cereals (rice, wheat, quinoa, etc.)
CREATE TABLE IF NOT EXISTS grains (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Fresh vegetables
CREATE TABLE IF NOT EXISTS vegetables (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    image TEXT
);

-- Orders table for customer purchases
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    delivery_employee_id BIGINT,
    payment_handler_id BIGINT,
    total DOUBLE NOT NULL,
    status VARCHAR(255),
    delivery_address VARCHAR(255),
    details VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_receipt VARCHAR(255),
    payment_status VARCHAR(50),
    created_at DATETIME(6),
    CONSTRAINT FK_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT FK_orders_delivery_employee FOREIGN KEY (delivery_employee_id) REFERENCES employees(id),
    CONSTRAINT FK_orders_payment_handler FOREIGN KEY (payment_handler_id) REFERENCES employees(id)
);

-- Order items table for individual products in each order
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    CONSTRAINT FK_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT FK_order_items_product FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Favourites table for storing user favourite products
CREATE TABLE IF NOT EXISTS favourites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_favourites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_favourites_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Create indexes for better query performance on favourites
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_product_id ON favourites(product_id);
