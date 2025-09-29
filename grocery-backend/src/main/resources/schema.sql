
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    address VARCHAR(255),
    phoneNumber VARCHAR(50),
    birthdate DATE,
    role VARCHAR(50)
);

-- Additional tables or constraints can be added below
