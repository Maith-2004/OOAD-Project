-- ============================================
-- Grocery Management System - Complete Database
-- Date: October 22, 2025
-- Contains all data for production/testing
-- ============================================

-- ============================================
-- USERS TABLE (Customers & Managers)
-- Password format: BCrypt hashed
-- Default password for all test accounts: "password"
-- ============================================

INSERT IGNORE INTO users (id, username, email, password, role, phone, address) VALUES 
(1, 'manager', 'manager@grocery.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'manager', '1234567890', '123 Manager St'),
(2, 'Manager', 'mang@gmail.com', '$2a$10$QIVKBDafM.2ss.dKr82HDutXRUJlxiX8sL4JDLYwG2cP37d5To8nS', 'manager', '0760348879', '13/5A, Sebastians road, Kandana');

-- Sample customers with realistic data
INSERT IGNORE INTO users (username, email, password, role, phone, address) VALUES
('john_doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0771234567', '45 Galle Road, Colombo 03'),
('sarah_smith', 'sarah@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0772345678', '12 Kandy Road, Kaduwela'),
('mike_wilson', 'mike@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0773456789', '78 Negombo Road, Wattala'),
('emma_brown', 'emma@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0774567890', '34 Main Street, Nugegoda'),
('david_lee', 'david@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0775678901', '56 Temple Road, Maharagama'),
('lisa_kumar', 'lisa@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0776789012', '89 Station Road, Dehiwala'),
('james_perera', 'james@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0777890123', '23 Lake Road, Boralesgamuwa'),
('anna_fernando', 'anna@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0778901234', '67 Park Avenue, Moratuwa'),
('robert_silva', 'robert@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0779012345', '45 Hill Street, Mount Lavinia'),
('maria_dias', 'maria@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'customer', '0770123456', '12 Beach Road, Panadura'),
('worker_user', 'worker@grocery.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'worker', '0779876543', '78 Worker Lane, Colombo 05');

-- ============================================
-- EMPLOYEES TABLE
-- Roles: Worker, Delivery, Payment Handler, Manager
-- Password: "password" for all
-- ============================================

INSERT IGNORE INTO employees (id, name, email, password, address, phone_number, birthdate, role) VALUES 
(1, 'Kamal Perera', 'kamal@grocery.com', 'password', '12 Flower Road, Colombo 07', '0771112233', '1990-03-15', 'Worker'),
(2, 'Nimal Silva', 'nimal@grocery.com', 'password', '34 Temple Lane, Dehiwala', '0772223344', '1988-07-22', 'Worker'),
(3, 'Saman Fernando', 'saman@grocery.com', 'password', '56 Lake Drive, Nugegoda', '0773334455', '1992-11-08', 'Worker'),
(4, 'Chaminda Dias', 'chaminda@grocery.com', 'password', '78 Station Road, Maharagama', '0774445566', '1985-05-18', 'Delivery'),
(5, 'Ranjan Kumar', 'ranjan@grocery.com', 'password', '90 Main Street, Moratuwa', '0775556677', '1991-09-25', 'Delivery'),
(6, 'Prasad Wickrama', 'prasad@grocery.com', 'password', '23 Beach Road, Mount Lavinia', '0776667788', '1989-12-30', 'Delivery'),
(7, 'Ajith Bandara', 'ajith@grocery.com', 'password', '45 Hill View, Panadura', '0777778899', '1993-02-14', 'Delivery'),
(8, 'Sunil Jayasinghe', 'sunil@grocery.com', 'password', '67 Park Avenue, Boralesgamuwa', '0778889900', '1987-06-20', 'Payment Handler'),
(9, 'Rohan Amarasena', 'rohan@grocery.com', 'password', '89 Garden Road, Kottawa', '0779990011', '1990-10-05', 'Payment Handler'),
(10, 'Dinesh Rajapaksa', 'dinesh@grocery.com', 'password', '11 Castle Street, Battaramulla', '0770001122', '1986-04-12', 'Manager');

-- ============================================
-- PRODUCT TABLE (General/Household Items)
-- ============================================

INSERT IGNORE INTO product (name, description, price, quantity) VALUES 
('Toilet Paper', '12-roll pack soft toilet tissue', 450.00, 120),
('Hand Sanitizer', '500ml antibacterial hand gel', 250.00, 85),
('Batteries AA', 'Alkaline batteries 4-pack', 380.00, 65),
('Shopping Bags', 'Reusable eco-friendly bags', 150.00, 45),
('Dish Soap', 'Lemon fresh dish washing liquid 1L', 320.00, 75),
('Laundry Detergent', 'Premium washing powder 2kg', 850.00, 50),
('Paper Towels', 'Absorbent kitchen rolls 4-pack', 550.00, 60),
('Trash Bags', 'Heavy duty garbage bags 30L', 420.00, 55),
('Sponges', 'Kitchen cleaning sponges 5-pack', 180.00, 90),
('Air Freshener', 'Lavender room spray 300ml', 380.00, 70),
('Aluminum Foil', 'Kitchen foil roll 30m', 450.00, 40),
('Plastic Wrap', 'Cling film food wrap 100m', 280.00, 50),
('Ziplock Bags', 'Resealable storage bags assorted', 320.00, 65),
('Candles', 'Emergency candles 6-pack', 250.00, 45),
('Matches', 'Safety matchboxes 10-pack', 120.00, 80);

-- ============================================
-- BAKERY TABLE
-- ============================================

INSERT IGNORE INTO bakery (name, description, price, quantity) VALUES 
('White Bread', 'Fresh white bread loaf 400g', 120.00, 150),
('Whole Wheat Bread', 'Healthy whole grain bread 450g', 140.00, 120),
('Butter Croissant', 'French butter croissant', 85.00, 80),
('Chocolate Croissant', 'Chocolate filled croissant', 95.00, 70),
('Dinner Rolls', 'Soft dinner rolls 6-pack', 180.00, 90),
('Bagels Plain', 'Fresh plain bagels 4-pack', 220.00, 60),
('Bagels Sesame', 'Sesame seed bagels 4-pack', 240.00, 55),
('Baguette', 'Crusty French baguette', 150.00, 45),
('Cinnamon Rolls', 'Sweet cinnamon rolls 4-pack', 320.00, 50),
('Muffins Blueberry', 'Blueberry muffins 6-pack', 380.00, 40),
('Muffins Chocolate', 'Chocolate chip muffins 6-pack', 380.00, 45),
('Donuts Glazed', 'Glazed donuts 6-pack', 420.00, 55),
('Donuts Chocolate', 'Chocolate glazed donuts 6-pack', 450.00, 50),
('Banana Bread', 'Moist banana bread loaf', 280.00, 35),
('Pound Cake', 'Classic vanilla pound cake', 520.00, 25),
('Brownies', 'Fudgy chocolate brownies 6-pack', 350.00, 60),
('Cookies Chocolate Chip', 'Chocolate chip cookies 12-pack', 280.00, 75),
('Cookies Oatmeal', 'Oatmeal raisin cookies 12-pack', 260.00, 70),
('Apple Pie', 'Fresh baked apple pie', 850.00, 15),
('Cheesecake', 'New York style cheesecake', 980.00, 12),
('Cupcakes Vanilla', 'Vanilla cupcakes 6-pack', 420.00, 45),
('Cupcakes Chocolate', 'Chocolate cupcakes 6-pack', 450.00, 40),
('Danish Pastry', 'Assorted danish pastries 4-pack', 380.00, 35),
('Scones', 'Buttermilk scones 4-pack', 320.00, 40),
('Pretzels', 'Soft pretzels 4-pack', 280.00, 50);

-- ============================================
-- FRUITS TABLE
-- ============================================

INSERT IGNORE INTO fruits (name, description, price, quantity) VALUES 
('Red Apples', 'Fresh crisp red apples per kg', 380.00, 200),
('Green Apples', 'Tart green apples per kg', 420.00, 150),
('Bananas', 'Ripe yellow bananas per kg', 180.00, 300),
('Oranges', 'Sweet juicy oranges per kg', 280.00, 180),
('Mandarins', 'Easy peel mandarins per kg', 320.00, 120),
('Grapes Red', 'Seedless red grapes per kg', 680.00, 80),
('Grapes Green', 'Seedless green grapes per kg', 650.00, 75),
('Watermelon', 'Fresh watermelon per kg', 120.00, 150),
('Pineapple', 'Sweet golden pineapple each', 220.00, 60),
('Mango', 'Ripe mangoes per kg', 450.00, 100),
('Papaya', 'Fresh papaya per kg', 180.00, 90),
('Avocado', 'Hass avocados each', 280.00, 70),
('Strawberries', 'Fresh strawberries 250g pack', 520.00, 45),
('Blueberries', 'Fresh blueberries 200g pack', 780.00, 35),
('Kiwi', 'Green kiwi fruits per kg', 680.00, 50),
('Pomegranate', 'Fresh pomegranates each', 320.00, 65),
('Dragon Fruit', 'Red dragon fruit each', 420.00, 40),
('Lemon', 'Fresh lemons per kg', 280.00, 120),
('Lime', 'Green limes per kg', 250.00, 110),
('Peach', 'Sweet peaches per kg', 580.00, 55),
('Plum', 'Fresh plums per kg', 520.00, 60),
('Cherry', 'Fresh cherries per kg', 980.00, 30),
('Guava', 'Pink guava per kg', 220.00, 80),
('Wood Apple', 'Wood apple (divul) each', 120.00, 90),
('Passion Fruit', 'Fresh passion fruit per kg', 380.00, 45);

-- Sample dairy products
INSERT IGNORE INTO dairy (name, description, price, quantity) VALUES 
('Milk', '1L whole milk', 2.99, 50),
('Cheese', 'Cheddar cheese', 4.99, 25),
('Yogurt', 'Greek yogurt', 1.99, 40);

-- Sample meat products
INSERT IGNORE INTO meat (name, description, price, quantity) VALUES 
('Chicken', 'Fresh chicken breast', 6.99, 15),
('Beef', 'Ground beef', 5.99, 20);

-- Sample beverages
INSERT IGNORE INTO beverages (name, description, price, quantity) VALUES 
('Orange Juice', 'Fresh orange juice 1L', 2.99, 35),
('Cola', 'Cola drink 500ml', 1.50, 50);

-- Sample grains and cereals
INSERT IGNORE INTO grains (name, description, price, quantity) VALUES 
('Rice', 'Basmati rice 1kg', 3.99, 60),
('Wheat Flour', 'All purpose flour 2kg', 2.75, 45),
('Quinoa', 'Organic quinoa 500g', 8.50, 20),
('Oats', 'Steel cut oats 1kg', 4.25, 35);

-- Sample vegetables
INSERT IGNORE INTO vegetables (name, description, price, quantity) VALUES 
('Tomato', 'Fresh red tomatoes', 2.49, 80),
('Carrot', 'Fresh carrots 1kg bag', 1.99, 60),
('Onion', 'Yellow onions 2kg bag', 3.49, 50),
('Bell Pepper', 'Mixed bell peppers', 4.99, 40),
('Broccoli', 'Fresh broccoli crown', 2.99, 30),
('Lettuce', 'Iceberg lettuce head', 1.79, 45);

-- Sample employee data with three role types: Delivery, Worker, Payment Handler
INSERT IGNORE INTO employees (name, email, password, address, phone_number, birthdate, role) VALUES 
('Alex Rodriguez', 'alex.rodriguez@grocery.com', 'password', '321 Delivery Lane', '555-0104', '1992-03-08', 'Delivery'),
('Emma Thompson', 'emma.thompson@grocery.com', 'password', '654 Transport Street', '555-0105', '1989-07-21', 'Delivery'),
('James Wilson', 'james.wilson@grocery.com', 'password', '987 Route Avenue', '555-0106', '1991-11-14', 'Delivery'),
('John Smith', 'john.smith@grocery.com', 'password', '123 Main Street', '555-0101', '1990-05-15', 'Worker'),
('Sarah Johnson', 'sarah.johnson@grocery.com', 'password', '456 Oak Avenue', '555-0102', '1985-08-22', 'Worker'),
('Mike Davis', 'mike.davis@grocery.com', 'password', '789 Pine Road', '555-0103', '1988-12-10', 'Payment Handler');

-- Sample favourites data (optional - for testing purposes)
-- Uncomment the lines below to add sample favourites for testing
-- User ID 1 (manager) has some favourite products
-- INSERT IGNORE INTO favourites (user_id, product_id) VALUES 
-- (1, 1), -- Toilet Paper
-- (1, 5), -- Hand Sanitizer
-- (1, 2); -- White Bread (from bakery, but would need to adjust if using category-specific IDs)

