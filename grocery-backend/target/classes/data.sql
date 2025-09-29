DELETE FROM users;
-- ALTER TABLE users ADD CONSTRAINT chk_role CHECK (role IN ('manager', 'customer'));
INSERT INTO users (username, email, password, role, phone, address) VALUES
('manager1', 'manager@example.com', '$2a$10$wQw1Qw1Qw1Qw1Qw1Qw1QwOeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'manager', '1234567890', 'Manager Address'),
('customer1', 'customer@example.com', '$2a$10$wQw1Qw1Qw1Qw1Qw1Qw1QwOeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw2', 'customer', '0987654321', 'Customer Address');
