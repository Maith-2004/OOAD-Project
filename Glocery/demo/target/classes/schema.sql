CREATE DATABASE grocery_db;
USE grocery_db;


CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50)
);

CREATE TABLE product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE,
    stock INT
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    order_date DATETIME,
    status VARCHAR(50),
    total_amount DOUBLE,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE payment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    payment_date DATETIME,
    payment_method VARCHAR(50),
    amount DOUBLE,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
